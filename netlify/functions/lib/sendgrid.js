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
  console.log(`📧 sendEmail function called:`)
  console.log(`   Timestamp: ${new Date().toISOString()}`)
  console.log(`   To: ${to}`)
  console.log(`   Subject: ${subject}`)
  console.log(`   HTML length: ${html?.length || 0} characters`)
  console.log(`   SendGrid API Key configured: ${process.env.SENDGRID_API_KEY ? 'YES' : 'NO'}`)
  console.log(`   SendGrid API Key starts with SG.: ${process.env.SENDGRID_API_KEY?.startsWith('SG.') ? 'YES' : 'NO'}`)
  console.log(`   SendGrid API Key is placeholder: ${process.env.SENDGRID_API_KEY === 'your_sendgrid_api_key_here' ? 'YES' : 'NO'}`)
  console.log(`   SendGrid API Key length: ${process.env.SENDGRID_API_KEY?.length || 0}`)
  
  if (!process.env.SENDGRID_API_KEY || 
      process.env.SENDGRID_API_KEY === 'your_sendgrid_api_key_here' ||
      !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
    console.log(`⚠️ SendGrid not configured, skipping email to ${to}`);
    console.log(`⚠️ Skip timestamp: ${new Date().toISOString()}`);
    return { success: false, error: 'SendGrid API key not configured' };
  }

  const msg = {
    to,
    from: 'Custom Lead Match Team <noreply@customleadmatch.com>',
    subject,
    html,
  };

  console.log(`📧 Attempting to send email via SendGrid...`)
  console.log(`📧 Send attempt timestamp: ${new Date().toISOString()}`)
  console.log(`📧 Message payload:`, { to: msg.to, from: msg.from, subject: msg.subject, htmlLength: msg.html.length })
  
  try {
    const result = await sgMail.send(msg);
    console.log(`✅ Email sent successfully to ${to}`);
    console.log(`✅ SendGrid response:`, result[0]?.statusCode);
    console.log(`✅ Success timestamp: ${new Date().toISOString()}`);
    return { success: true, statusCode: result[0]?.statusCode };
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error.message);
    console.error(`❌ SendGrid error details:`, error.response?.body || error);
    console.error(`❌ Error timestamp: ${new Date().toISOString()}`);
    return { success: false, error: error.message };
  }
}
