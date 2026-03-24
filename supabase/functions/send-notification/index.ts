import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotificationRequest {
  type: "new_signup" | "account_approved" | "course_completed" | "training_reminder";
  email?: string;
  userId?: string;
  data: {
    userName?: string;
    courseName?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, userId, data }: NotificationRequest = await req.json();
    console.log("Sending notification:", { type, email, userId, data });

    // Authenticate caller - require valid JWT for all notification types
    const authHeader = req.headers.get("Authorization");
    
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const callerUserId = claimsData.claims.sub as string;
    const callerEmail = (claimsData.claims as any).email as string;

    // For admin-only actions, verify admin role
    if (type === "account_approved" || type === "training_reminder" || type === "new_signup") {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const { data: roleData } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", callerUserId)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }

    // For course_completed, ensure target email matches caller
    if (type === "course_completed" && email && email !== callerEmail) {
      return new Response(JSON.stringify({ error: "Forbidden: email mismatch" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let targetEmail = email;

    // For training_reminder, we need to look up the user's email
    if (type === "training_reminder" && userId && !targetEmail) {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
      targetEmail = userData?.user?.email;
      if (!targetEmail) {
        throw new Error("User email not found");
      }
    }

    if (!targetEmail) {
      throw new Error("No email provided");
    }

    let subject = "";
    let html = "";

    switch (type) {
      case "new_signup":
        subject = "Hoş Geldiniz - TheCompany Coffee Academy";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0;">TheCompany Coffee Academy</h1>
            </div>
            <div style="padding: 40px; background: #f9fafb;">
              <h2 style="color: #1f2937;">Merhaba ${data.userName || "Değerli Öğrenci"},</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                TheCompany Coffee Academy'e hoş geldiniz! Kayıt işleminiz başarıyla tamamlandı.
              </p>
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0;">
                <p style="color: #92400e; margin: 0; font-size: 14px;">
                  <strong>⏳ Hesap Onayı Bekleniyor</strong><br/>
                  Hesabınıza tam erişim sağlamak için yönetici onayı gerekmektedir. 
                  Onaylandığınızda size tekrar email göndereceğiz.
                </p>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
                Sevgilerle,<br/>
                <strong>TheCompany Coffee Academy Ekibi</strong>
              </p>
            </div>
          </div>
        `;
        break;

      case "account_approved":
        subject = "🎉 Hesabınız Onaylandı!";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0;">🎉 Harika Haberler!</h1>
            </div>
            <div style="padding: 40px; background: #f9fafb;">
              <h2 style="color: #1f2937;">Merhaba ${data.userName || "Değerli Öğrenci"},</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Hesabınız onaylandı! Artık TheCompany Coffee Academy'deki tüm kurslara erişebilirsiniz.
              </p>
              <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0;">
                <p style="color: #065f46; margin: 0; font-size: 14px;">
                  <strong>✅ Hesabınız Aktif</strong><br/>
                  Şimdi giriş yaparak kahve eğitimlerine başlayabilirsiniz!
                </p>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
                İyi öğrenmeler!<br/>
                <strong>TheCompany Coffee Academy Ekibi</strong>
              </p>
            </div>
          </div>
        `;
        break;

      case "course_completed":
        subject = `🏆 Tebrikler! "${data.courseName}" Kursunu Tamamladınız!`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 36px;">🏆</h1>
              <h2 style="color: white; margin: 10px 0 0 0;">Tebrikler!</h2>
            </div>
            <div style="padding: 40px; background: #f9fafb;">
              <h2 style="color: #1f2937;">Harika İş, ${data.userName || "Değerli Öğrenci"}!</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                "<strong>${data.courseName}</strong>" kursunu başarıyla tamamladınız! 🎉
              </p>
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0;">
                <p style="color: #92400e; margin: 0; font-size: 14px;">
                  <strong>📜 Sertifikanız Hazır!</strong><br/>
                  Admin panelinizden sertifikanızı indirebilir ve sosyal medyada paylaşabilirsiniz.
                </p>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
                Başarılarınızın devamını dileriz!<br/>
                <strong>TheCompany Coffee Academy Ekibi</strong>
              </p>
            </div>
          </div>
        `;
        break;

      case "training_reminder":
        subject = `⏰ Eğitim Hatırlatması: "${data.courseName}"`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 36px;">⏰</h1>
              <h2 style="color: white; margin: 10px 0 0 0;">Eğitim Hatırlatması</h2>
            </div>
            <div style="padding: 40px; background: #f9fafb;">
              <h2 style="color: #1f2937;">Merhaba ${data.userName || "Değerli Personel"},</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                "<strong>${data.courseName}</strong>" eğitimini henüz tamamlamadınız.
              </p>
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0;">
                <p style="color: #92400e; margin: 0; font-size: 14px;">
                  <strong>📚 Eğitiminizi Tamamlayın</strong><br/>
                  Lütfen en kısa sürede giriş yaparak eğitiminize devam edin.
                </p>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
                İyi çalışmalar,<br/>
                <strong>TheCompany Coffee Academy Ekibi</strong>
              </p>
            </div>
          </div>
        `;
        break;

      default:
        throw new Error("Invalid notification type");
    }

    const emailResponse = await resend.emails.send({
      from: "TheCompany Coffee Academy <onboarding@resend.dev>",
      to: [targetEmail],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, id: emailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
