import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Public redirect endpoint — no auth required.
// Looks up a short code and redirects to the original recovery URL.
Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    // The function is mounted at /functions/v1/redirect-short-link
    // Code is passed as ?c=XXXX
    const code = url.searchParams.get("c");

    if (!code) {
      return new Response("Geçersiz link", { status: 400 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    const { data, error } = await adminClient
      .from("short_links")
      .select("target_url, expires_at")
      .eq("code", code)
      .maybeSingle();

    if (error || !data) {
      return new Response(
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Link Geçersiz</title></head>
        <body style="font-family:sans-serif;text-align:center;padding:48px">
        <h2>Link bulunamadı</h2>
        <p>Bu şifre oluşturma linki geçersiz veya silinmiş.</p>
        </body></html>`,
        { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    if (new Date(data.expires_at) < new Date()) {
      return new Response(
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Link Süresi Doldu</title></head>
        <body style="font-family:sans-serif;text-align:center;padding:48px">
        <h2>Linkin süresi doldu</h2>
        <p>Lütfen yöneticinizden yeni bir şifre oluşturma linki isteyin.</p>
        </body></html>`,
        { status: 410, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    return Response.redirect(data.target_url, 302);
  } catch (err: any) {
    return new Response(`Hata: ${err.message}`, { status: 500 });
  }
});
