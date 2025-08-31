import { Handler } from "@netlify/functions";
import { sendEmail } from "./lib/sendgrid.js";

export const handler: Handler = async (event) => {
  try {
    const { to, first_name, service_category, city, state, summary, lead_id, new_balance } =
      JSON.parse(event.body || "{}");
    if (!to || !first_name || !lead_id) throw new Error("Missing params");

    const dashboardUrl = `${process.env.URL || 'https://customleadmatch.netlify.app'}/contractor-login`;
    
    const emailSubject = 'Lead Purchase Confirmation - Custom Lead Match';
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Lead Purchase Confirmed!</h2>
        <p>Hi ${first_name},</p>
        
        <p>Your lead purchase has been confirmed. Here are the details:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Lead ID:</strong> ${lead_id}</p>
          <p><strong>Service Category:</strong> ${service_category}</p>
          <p><strong>Location:</strong> ${city}, ${state}</p>
          <p><strong>Summary:</strong> ${summary}</p>
        </div>
        
        <p><strong>Your new wallet balance:</strong> $${new_balance}</p>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="${dashboardUrl}" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">👉 View Lead Details</a>
        </p>
        
        <p>Best regards,<br>The Custom Lead Match Team</p>
      </div>
    `;

    await sendEmail(to, emailSubject, emailHtml);
    console.log(`✅ Lead confirmation email sent successfully to ${to}`);
    
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e: any) {
    console.error(`❌ Lead confirmation email failed:`, e);
    return { statusCode: 400, body: JSON.stringify({ error: e.message }) };
  }
};
