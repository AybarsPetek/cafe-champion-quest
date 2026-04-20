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

    // Verify caller is admin
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

    const { userIds } = await req.json();

    // If specific user IDs provided, use those; otherwise get all users without temp passwords
    let targetUserIds: string[] = userIds || [];

    if (targetUserIds.length === 0) {
      // Get all non-admin profiles that still need to change their password
      // (i.e. must_change_password = true). Users who already changed their
      // password are skipped so we don't overwrite their chosen password.
      const { data: profiles } = await adminClient
        .from("profiles")
        .select("id, must_change_password");

      const { data: adminRoles } = await adminClient
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      const adminSet = new Set((adminRoles || []).map((r: any) => r.user_id));

      targetUserIds = (profiles || [])
        .filter((p: any) => p.must_change_password === true && !adminSet.has(p.id))
        .map((p: any) => p.id);
    }

    const results: any[] = [];

    for (const userId of targetUserIds) {
      try {
        const tempPassword = `Temp${Math.floor(1000 + Math.random() * 9000)}!`;

        const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, {
          password: tempPassword,
        });

        if (updateError) {
          results.push({ userId, status: "error", message: updateError.message });
          continue;
        }

        // Store hashed temp password (not plaintext)
        const hashedPassword = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(tempPassword));
        const hashHex = Array.from(new Uint8Array(hashedPassword)).map(b => b.toString(16).padStart(2, '0')).join('');
        await adminClient
          .from("user_temp_passwords")
          .upsert({ user_id: userId, temp_password: hashHex }, { onConflict: "user_id" });

        await adminClient
          .from("profiles")
          .update({ must_change_password: true })
          .eq("id", userId);

        results.push({ userId, status: "success", tempPassword });
      } catch (err: any) {
        results.push({ userId, status: "error", message: err.message });
      }
    }

    return new Response(
      JSON.stringify({ results, totalProcessed: results.length, successCount: results.filter((r: any) => r.status === "success").length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
