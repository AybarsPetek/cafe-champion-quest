import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApproveUserRequest {
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { userId }: ApproveUserRequest = await req.json();
    console.log("Approving user:", userId);

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw profileError;
    }

    // Get user auth data for email
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (userError) {
      console.error("Error fetching user:", userError);
      throw userError;
    }

    // Approve user
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ is_approved: true })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      throw updateError;
    }

    console.log("User approved successfully");

    // Send approval email
    if (user?.email) {
      try {
        const emailResponse = await supabaseAdmin.functions.invoke("send-notification", {
          body: {
            type: "account_approved",
            email: user.email,
            data: {
              userName: profile?.full_name || "Değerli Öğrenci",
            },
          },
        });

        console.log("Approval email sent:", emailResponse);
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError);
        // Don't throw error, approval was successful even if email failed
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "User approved successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error approving user:", error);
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
