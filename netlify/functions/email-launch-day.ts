import { Handler } from "@netlify/functions";
import { sendEmail } from "./lib/sendgrid";

export const handler: Handler = async (event) => {
  try {
    const { to, first_name, company, trade } = JSON.parse(event.body || "{}");
    if (!to || !first_name) throw new Error("Missing required params: to, first_name");

    const subject = "🎉 We're Live! Your $25 Credit is Ready";
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Custom Lead Match - We're Live!</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">Custom Lead Match</h1>
          <p style="color: #666; font-size: 16px;">Professional Lead Generation Platform</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
          <h2 style="margin-bottom: 15px; font-size: 28px;">🎉 We're Live!</h2>
          <p style="font-size: 18px; margin-bottom: 0;">
            Custom Lead Match is officially open for business!
          </p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #1e40af; margin-bottom: 20px;">Hi ${first_name}! 👋</h3>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Thank you for joining our pre-launch waitlist! We're excited to welcome you as one of our founding members.
          </p>
          
          <div style="background: #dcfce7; border: 2px solid #16a34a; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center;">
            <h4 style="color: #15803d; margin-bottom: 10px; font-size: 20px;">🎁 Welcome Bonus</h4>
            <p style="font-size: 24px; font-weight: bold; color: #15803d; margin-bottom: 5px;">$25 FREE CREDIT</p>
            <p style="font-size: 14px; color: #166534; margin-bottom: 0;">Already added to your account!</p>
          </div>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            As a ${trade} professional${company !== '—' ? ` at ${company}` : ''}, you now have access to:
          </p>
          
          <ul style="font-size: 16px; margin-bottom: 25px; padding-left: 20px;">
            <li style="margin-bottom: 8px;">🎯 High-quality leads in your service area</li>
            <li style="margin-bottom: 8px;">📱 Real-time SMS and email notifications</li>
            <li style="margin-bottom: 8px;">💼 Professional contractor dashboard</li>
            <li style="margin-bottom: 8px;">🔒 Secure payment processing</li>
            <li style="margin-bottom: 8px;">📊 Lead tracking and analytics</li>
          </ul>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://customleadmatch.netlify.app/login" 
               style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
              Login to Your Dashboard →
            </a>
          </div>
        </div>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
          <h4 style="color: #92400e; margin-bottom: 10px;">💡 Getting Started Tips:</h4>
          <ul style="font-size: 14px; color: #92400e; margin-bottom: 0; padding-left: 20px;">
            <li style="margin-bottom: 5px;">Complete your profile to receive better-matched leads</li>
            <li style="margin-bottom: 5px;">Set up your service areas and preferences</li>
            <li style="margin-bottom: 5px;">Enable SMS notifications for instant lead alerts</li>
            <li style="margin-bottom: 0;">Use your $25 credit to purchase your first leads</li>
          </ul>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
          <p style="font-size: 12px; color: #9ca3af; margin-bottom: 5px;">
            Custom Lead Match - Professional Lead Generation
          </p>
          <p style="font-size: 12px; color: #9ca3af;">
            Questions? Reply to this email or contact support@customleadmatch.com
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
