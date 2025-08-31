import { Handler } from "@netlify/functions";
import { sendEmail } from "./lib/sendgrid.js";

export const handler: Handler = async (event) => {
  try {
    const { to, first_name, ticket_id, snippet } = JSON.parse(event.body || "{}");
    if (!to || !first_name || !ticket_id) throw new Error("Missing params");

    const dashboardUrl = `${process.env.URL || 'https://customleadmatch.netlify.app'}/contractor-login`;
    
    const emailSubject = `Support Reply - Ticket #${ticket_id}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Support Team Reply</h2>
        <p>Hi ${first_name},</p>
        
        <p>We've received your support request and wanted to follow up with you.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Ticket ID:</strong> ${ticket_id}</p>
          ${snippet ? `<p><strong>Update:</strong> ${snippet}</p>` : ''}
        </div>
        
        <p>Our support team will continue to work on your request and will follow up with you soon.</p>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="${dashboardUrl}" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">👉 Access Dashboard</a>
        </p>
        
        <p>Best regards,<br>The Custom Lead Match Support Team</p>
      </div>
    `;

    await sendEmail(to, emailSubject, emailHtml);
    console.log(`✅ Support reply email sent successfully to ${to}`);
    
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e: any) {
    console.error(`❌ Support reply email failed:`, e);
    return { statusCode: 400, body: JSON.stringify({ error: e.message }) };
  }
};
