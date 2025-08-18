import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail(to, subject, html) {
  const msg = {
    to,
    from: 'support@customleadmatch.com',
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Email sent successfully to ${to}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ SendGrid error:`, error);
    return { success: false, error: error.message };
  }
}
