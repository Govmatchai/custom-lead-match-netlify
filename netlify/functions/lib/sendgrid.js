import sgMail from '@sendgrid/mail';
import { ProductionLogger } from './logger.js';
import dotenv from 'dotenv';

try {
  dotenv.config({ path: '../../.env' });
} catch (error) {
  console.log('dotenv config failed, using environment variables directly');
}

const logger = new ProductionLogger('sendgrid');

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
  console.log(`📧 sendEmail function called: ${to}, ${subject}`)
  
  await logger.info('SENDGRID FUNCTION CALLED', {
    to,
    subject,
    htmlLength: html?.length || 0,
    apiKeyConfigured: !!process.env.SENDGRID_API_KEY,
    apiKeyStartsWithSG: process.env.SENDGRID_API_KEY?.startsWith('SG.'),
    apiKeyIsPlaceholder: process.env.SENDGRID_API_KEY === 'your_sendgrid_api_key_here',
    apiKeyLength: process.env.SENDGRID_API_KEY?.length || 0
  }, null, null, to)
  
  if (!process.env.SENDGRID_API_KEY || 
      process.env.SENDGRID_API_KEY === 'your_sendgrid_api_key_here' ||
      !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
    console.log(`⚠️ SendGrid not configured, skipping email to ${to}`)
    await logger.error('SENDGRID NOT CONFIGURED', {
      apiKey: process.env.SENDGRID_API_KEY ? 'SET' : 'NOT_SET',
      isPlaceholder: process.env.SENDGRID_API_KEY === 'your_sendgrid_api_key_here'
    }, null, null, to)
    return { success: false, error: 'SendGrid API key not configured' };
  }

  const msg = {
    to,
    from: 'Custom Lead Match Team <noreply@customleadmatch.com>',
    subject,
    html,
  };

  console.log(`📧 Attempting to send email via SendGrid...`)
  await logger.info('ATTEMPTING SENDGRID SEND', {
    to: msg.to,
    from: msg.from,
    subject: msg.subject,
    htmlLength: msg.html.length
  }, null, null, to)
  
  try {
    const result = await sgMail.send(msg);
    console.log(`✅ Email sent successfully to ${to}`)
    await logger.info('SENDGRID SUCCESS', {
      statusCode: result[0]?.statusCode,
      messageId: result[0]?.headers?.['x-message-id']
    }, null, null, to)
    return { success: true, statusCode: result[0]?.statusCode };
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error.message)
    await logger.error('SENDGRID ERROR', {
      message: error.message,
      responseBody: error.response?.body,
      statusCode: error.code
    }, null, null, to)
    return { success: false, error: error.message };
  }
}
