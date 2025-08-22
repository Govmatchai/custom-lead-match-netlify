import { Handler } from "@netlify/functions";
import { sendEmail } from "./lib/sendgrid";

export const handler: Handler = async (event) => {
  try {
    const { to, first_name, company, trade } = JSON.parse(event.body || "{}");
    if (!to || !first_name) throw new Error("Missing required params: to, first_name");

    const subject = "We're Launching Soon! 🚀";
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Custom Lead Match - Launching Soon</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">Custom Lead Match</h1>
          <p style="color: #666; font-size: 16px;">Professional Lead Generation Platform</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #1e40af; margin-bottom: 20px;">Hi ${first_name}! 👋</h2>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Great news! We're putting the finishing touches on Custom Lead Match and will be launching very soon.
          </p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            As a ${trade} professional${company !== '—' ? ` at ${company}` : ''}, you'll have access to:
          </p>
          
          <ul style="font-size: 16px; margin-bottom: 20px; padding-left: 20px;">
            <li style="margin-bottom: 8px;">🎯 High-quality leads in your service area</li>
            <li style="margin-bottom: 8px;">💰 <strong>$25 free credit</strong> to get you started</li>
            <li style="margin-bottom: 8px;">📱 Real-time lead notifications</li>
            <li style="margin-bottom: 8px;">🔒 Secure, professional platform</li>
          </ul>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            We'll notify you the moment we go live so you can start receiving leads immediately!
          </p>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <p style="font-size: 14px; color: #666;">
            Stay tuned for our launch announcement coming very soon!
          </p>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
          <p style="font-size: 12px; color: #9ca3af; margin-bottom: 5px;">
            Custom Lead Match - Professional Lead Generation
          </p>
          <p style="font-size: 12px; color: #9ca3af;">
            You're receiving this because you signed up for our pre-launch waitlist.
          </p>
        </div>
      </body>
      </html>
    `;

    const result = await sendEmail(to, subject, html);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to send email');
    }
    
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e: any) {
    return { statusCode: 400, body: JSON.stringify({ error: e.message }) };
  }
};
