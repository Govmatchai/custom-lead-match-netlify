import { Handler } from "@netlify/functions";
import { sendTemplateEmail, appBaseUrl } from "./lib/email";

const LAUNCH_DAY_TEMPLATE_ID = Number(process.env.LAUNCH_DAY_TEMPLATE_ID);

export const handler: Handler = async (event) => {
  try {
    const { to, first_name, company, trade } = JSON.parse(event.body || "{}");
    if (!to || !first_name) throw new Error("Missing required params: to, first_name");

    await sendTemplateEmail(to, LAUNCH_DAY_TEMPLATE_ID, {
      first_name,
      company: company || '—',
      trade: trade || 'your industry',
      wallet_credit: '$25',
      app_base_url: appBaseUrl
    }, false);
    
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e: any) {
    return { statusCode: 400, body: JSON.stringify({ error: e.message }) };
  }
};
