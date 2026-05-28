import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailPayload {
  user: {
    email: string;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload = await req.text();

    // Verify the request is genuinely from Supabase Auth hooks.
    const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");
    if (!hookSecret) {
      console.error("SEND_EMAIL_HOOK_SECRET is not configured");
      return new Response(
        JSON.stringify({ error: { http_code: 500, message: "Server misconfigured" } }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let emailData: EmailPayload;
    try {
      // Supabase auth hook secrets are prefixed with "v1,whsec_"; the
      // standardwebhooks lib expects just the base64 secret portion.
      const normalizedSecret = hookSecret.replace(/^v1,whsec_/, "");
      const wh = new Webhook(normalizedSecret);
      const headers = Object.fromEntries(req.headers);
      emailData = wh.verify(payload, headers) as EmailPayload;
    } catch (verifyErr) {
      console.error("Webhook signature verification failed:", verifyErr);
      return new Response(
        JSON.stringify({ error: { http_code: 401, message: "Invalid signature" } }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { user, email_data } = emailData;
    const { token_hash, redirect_to, email_action_type, site_url } = email_data;
    
    console.log("Processing email for:", user.email);
    console.log("Email action type:", email_action_type);
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? site_url;
    
    // Build the verification link
    const verificationLink = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;
    
    let subject = "Password Reset Request";
    let htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🍽️ FoodShare</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #666; font-size: 14px;">If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">This link will expire in 24 hours for security reasons.</p>
          </div>
        </body>
      </html>
    `;
    
    // Handle different email types
    if (email_action_type === "signup" || email_action_type === "email_confirmation") {
      subject = "Welcome to FoodShare - Confirm Your Email";
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🍽️ FoodShare</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Welcome to FoodShare!</h2>
              <p>Thank you for joining our community. Please confirm your email address to get started:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Confirm Email</a>
              </div>
              <p style="color: #666; font-size: 14px;">If you didn't create an account with FoodShare, please ignore this email.</p>
            </div>
          </body>
        </html>
      `;
    }
    
    const { error } = await resend.emails.send({
      from: "FoodShare <onboarding@resend.dev>",
      to: [user.email],
      subject,
      html: htmlContent,
    });
    
    if (error) {
      console.error("Resend error:", error);
      throw error;
    }
    
    console.log("Email sent successfully to:", user.email);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({
        error: {
          http_code: error.code || 500,
          message: error.message || "Failed to send email",
        },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
