import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Yetkilendirme gerekli");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) throw new Error("Yetkisiz erişim");

    const adminClient = createClient(supabaseUrl, serviceKey);

    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleData) throw new Error("Admin yetkisi gerekli");

    const { personnel, action, redirectTo } = await req.json();
    const origin = (redirectTo || req.headers.get("origin") || "").replace(/\/$/, "");
    const finalRedirect = `${origin}/reset-password`;

    const makeShortCode = () => {
      const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
      const bytes = crypto.getRandomValues(new Uint8Array(8));
      let out = "";
      for (let i = 0; i < bytes.length; i++) out += alphabet[bytes[i] % alphabet.length];
      return out;
    };
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const createShortLink = async (longUrl: string): Promise<string> => {
      if (!origin) return longUrl;
      try {
        for (let attempt = 0; attempt < 5; attempt++) {
          const code = makeShortCode();
          const { error: insertErr } = await adminClient
            .from("short_links")
            .insert({ code, target_url: longUrl, created_by: user.id, expires_at: expiresAt });
          if (!insertErr) return `${origin}/s/${code}`;
          if (!insertErr.message?.includes("duplicate")) break;
        }
      } catch (e) {
        console.error("short link create failed", e);
      }
      return longUrl;
    };

    if (action === "preview") {
      const { data: profiles } = await adminClient.from("profiles").select("id, full_name, phone, store_name");
      const { data: { users: authUsers } } = await adminClient.auth.admin.listUsers({ perPage: 1000 });

      const phoneToProfile: Record<string, any> = {};
      const emailToProfile: Record<string, any> = {};

      profiles?.forEach((p: any) => {
        if (p.phone) {
          const normalized = p.phone.replace(/\D/g, "").replace(/^0/, "").slice(-10);
          phoneToProfile[normalized] = p;
        }
      });

      authUsers?.forEach((u: any) => {
        if (u.email) emailToProfile[u.id] = u.email;
      });

      const results = personnel.map((p: any) => {
        const normalizedPhone = (p.phone || "").replace(/\D/g, "").replace(/^0/, "").slice(-10);
        const existing = phoneToProfile[normalizedPhone];
        return {
          ...p,
          normalizedPhone,
          existingUserId: existing?.id || null,
          existingName: existing?.full_name || null,
          existingEmail: existing ? emailToProfile[existing.id] || null : null,
          status: existing ? "update" : "new",
        };
      });

      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "import") {
      const results: any[] = [];

      const { data: profiles } = await adminClient.from("profiles").select("id, phone");
      const phoneToId: Record<string, string> = {};
      profiles?.forEach((p: any) => {
        if (p.phone) {
          const normalized = p.phone.replace(/\D/g, "").replace(/^0/, "").slice(-10);
          phoneToId[normalized] = p.id;
        }
      });

      for (const person of personnel) {
        try {
          const normalizedPhone = (person.phone || "").replace(/\D/g, "").replace(/^0/, "").slice(-10);
          const existingId = phoneToId[normalizedPhone];

          if (existingId) {
            const updateData: any = {};
            if (person.full_name) updateData.full_name = person.full_name;
            if (person.phone) updateData.phone = person.phone;
            if (person.store_name) updateData.store_name = person.store_name;
            if (person.position) updateData.position = person.position;

            const { error } = await adminClient
              .from("profiles")
              .update(updateData)
              .eq("id", existingId);

            results.push({
              name: person.full_name,
              phone: person.phone,
              status: error ? "error" : "updated",
              message: error ? error.message : "Profil güncellendi",
            });
          } else {
            // Create a new user with a random strong password (never shown).
            // The user will set their own password via the recovery link below.
            const email = `${normalizedPhone}@personnel.local`;
            const randomPassword = crypto.randomUUID() + crypto.randomUUID();

            const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
              email,
              password: randomPassword,
              email_confirm: true,
              user_metadata: {
                full_name: person.full_name,
                phone: person.phone,
                store_name: person.store_name,
              },
            });

            if (createError) {
              results.push({
                name: person.full_name,
                phone: person.phone,
                status: "error",
                message: createError.message,
              });
            } else {
              await adminClient
                .from("profiles")
                .update({ is_approved: true, position: person.position || null })
                .eq("id", newUser.user.id);

              // Generate password setup link
              let passwordLink: string | null = null;
              try {
                const { data: linkData } = await adminClient.auth.admin.generateLink({
                  type: "recovery",
                  email,
                  options: { redirectTo: finalRedirect },
                });
                const longLink = linkData?.properties?.action_link ?? null;
                if (longLink) {
                  passwordLink = await createShortLink(longLink);
                }
              } catch (linkErr) {
                // Non-fatal: user is created, admin can re-generate the link later.
                console.error("Link generation failed:", linkErr);
              }

              results.push({
                name: person.full_name,
                phone: person.phone,
                store_name: person.store_name || "",
                status: "created",
                message: passwordLink
                  ? `Kullanıcı oluşturuldu (${email})`
                  : `Kullanıcı oluşturuldu, link sonradan üretilebilir (${email})`,
                email,
                passwordLink,
              });
            }
          }
        } catch (err: any) {
          results.push({
            name: person.full_name,
            phone: person.phone,
            status: "error",
            message: err.message,
          });
        }
      }

      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Geçersiz aksiyon");
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
