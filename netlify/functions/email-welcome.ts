import { Handler } from "@netlify/functions";
import { sendEmail } from "./lib/sendgrid.js";

export const handler: Handler = async (event) => {
  try {
    const { to, first_name, email, company, needs_password_setup } = JSON.parse(event.body || "{}");
    if (!to || !email) throw new Error("Missing required params: to, email");

    const dashboardUrl = `${process.env.URL || 'https://customleadmatch.netlify.app'}/contractor-login`;
    
    const emailSubject = 'Welcome to Custom Lead Match!';
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Custom Lead Match!</h2>
        <p>Hi ${first_name || 'there'},</p>
        
        <p>Welcome to Custom Lead Match — we're excited to have you on board!</p>
        
        <p>As part of our trusted contractor network, you'll start receiving high-quality, pre-screened leads tailored to your business${company ? ` at ${company}` : ''}.</p>
        
        <p>🎁 <strong>You've been credited with $25 in your wallet to get started!</strong></p>
        
        <p>🔐 Log into your dashboard anytime to view available leads, track claims, and manage your preferences:</p>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="${dashboardUrl}" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">👉 Access Your Dashboard</a>
        </p>
        
        <p>You'll also receive SMS alerts when new leads match your selected industry and location.</p>
        
        <p>Thanks again for joining!</p>
        
        <p>— The Custom Lead Match Team</p>
      </div>
    `;

    await sendEmail(to, emailSubject, emailHtml);
    console.log(`✅ Welcome email sent successfully to ${to} via SendGrid`);
    
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e: any) {
    console.error(`❌ Welcome email failed:`, e);
    return { statusCode: 400, body: JSON.stringify({ error: e.message }) };
  }
};
