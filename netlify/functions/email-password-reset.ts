import { Handler } from "@netlify/functions";
import { sendEmail } from "./lib/sendgrid.js";
import { supabaseAdmin } from "./lib/supabase";

export const handler: Handler = async (event) => {
  try {
    const { email } = JSON.parse(event.body || "{}");
    if (!email) throw new Error("Missing email");

    const appBaseUrl = process.env.URL || 'https://customleadmatch.netlify.app';
    
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: `${appBaseUrl}/reset-password` }
    });
    if (error || !data) throw new Error(error?.message || "Failed to generate link");
    const resetUrl = data.properties?.action_link;

    const emailSubject = 'Password Reset Request - Custom Lead Match';
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi there,</p>
        
        <p>We received a request to reset your password for your Custom Lead Match account.</p>
        
        <p>Click the button below to reset your password:</p>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">👉 Reset Password</a>
        </p>
        
        <p>If you didn't request this password reset, you can safely ignore this email.</p>
        
        <p>This link will expire in 24 hours for security reasons.</p>
        
        <p>Best regards,<br>The Custom Lead Match Team</p>
      </div>
    `;

    await sendEmail(email, emailSubject, emailHtml);
    console.log(`✅ Password reset email sent successfully to ${email}`);
    
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e: any) {
    console.error(`❌ Password reset email failed:`, e);
    return { statusCode: 400, body: JSON.stringify({ error: e.message }) };
  }
};
