import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

try {
  if (process.env.SENDGRID_API_KEY && 
      process.env.SENDGRID_API_KEY !== 'your_sendgrid_api_key_here' &&
      process.env.SENDGRID_API_KEY.startsWith('SG.')) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  } else {
    console.log('SendGrid API key not configured or invalid format');
  }
} catch (error) {
  console.log('SendGrid initialization failed:', error.message);
}

export async function sendEmail(to, subject, html) {
  if (!process.env.SENDGRID_API_KEY || 
      process.env.SENDGRID_API_KEY === 'your_sendgrid_api_key_here' ||
      !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
    console.log(`⚠️ SendGrid not configured, skipping email to ${to}`);
    return { success: false, error: 'SendGrid API key not configured' };
  }

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
