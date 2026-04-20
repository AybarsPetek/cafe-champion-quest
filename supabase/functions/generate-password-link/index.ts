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

    const body = await req.json().catch(() => ({}));
    const { userIds, redirectTo } = body as { userIds?: string[]; redirectTo?: string };

    // Determine redirect target. The frontend should pass its own origin so the
    // generated link goes back to the correct site (preview / custom domain).
    const origin = redirectTo || req.headers.get("origin") || "";
    const finalRedirect = `${origin.replace(/\/$/, "")}/reset-password`;

    // If no userIds provided, generate links for ALL non-admin users
    let targetUserIds: string[] = userIds || [];
    if (targetUserIds.length === 0) {
      const { data: profiles } = await adminClient.from("profiles").select("id");
      const { data: adminRoles } = await adminClient
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");
      const adminSet = new Set((adminRoles || []).map((r: any) => r.user_id));
      targetUserIds = (profiles || [])
        .filter((p: any) => !adminSet.has(p.id))
        .map((p: any) => p.id);
    }

    // Fetch emails for the target users
    const { data: { users: authUsers } } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
    const emailMap = new Map<string, string>();
    (authUsers || []).forEach((u: any) => {
      if (u.email) emailMap.set(u.id, u.email);
    });

    const results: any[] = [];

    for (const userId of targetUserIds) {
      const email = emailMap.get(userId);
      if (!email) {
        results.push({ userId, status: "error", message: "E-posta bulunamadı" });
        continue;
      }

      try {
        const { data, error } = await adminClient.auth.admin.generateLink({
          type: "recovery",
          email,
          options: { redirectTo: finalRedirect },
        });

        if (error) {
          results.push({ userId, email, status: "error", message: error.message });
          continue;
        }

        const link = data?.properties?.action_link;
        if (!link) {
          results.push({ userId, email, status: "error", message: "Link üretilemedi" });
          continue;
        }

        results.push({ userId, email, status: "success", link });
      } catch (err: any) {
        results.push({ userId, email, status: "error", message: err.message });
      }
    }

    return new Response(
      JSON.stringify({
        results,
        totalProcessed: results.length,
        successCount: results.filter((r: any) => r.status === "success").length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
