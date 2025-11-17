import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "new_signup" | "account_approved" | "course_completed";
  email: string;
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
    const { type, email, data }: NotificationRequest = await req.json();
    console.log("Sending notification:", { type, email, data });

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
              <div style="text-align: center; margin: 32px 0;">
                <a href="${Deno.env.get("VITE_SUPABASE_URL")?.replace('https://', 'https://').split('.')[0]}.lovable.app" 
                   style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  Giriş Yap ve Öğrenmeye Başla
                </a>
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
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Bu başarınızla bir adım daha ilerlemeye devam ediyorsunuz. Diğer kurslarımıza göz atarak 
                kahve bilginizi geliştirmeye devam edebilirsiniz!
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${Deno.env.get("VITE_SUPABASE_URL")?.replace('https://', 'https://').split('.')[0]}.lovable.app/dashboard" 
                   style="background: #f59e0b; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  Panelime Git
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
                Başarılarınızın devamını dileriz!<br/>
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
      to: [email],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, id: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
