import { Handler } from "@netlify/functions";
import { sendTemplateEmail, appBaseUrl } from "./lib/email";

const LAUNCHING_SOON_TEMPLATE_ID = Number(process.env.LAUNCHING_SOON_TEMPLATE_ID);

export const handler: Handler = async (event) => {
  try {
    const { to, first_name, company, trade } = JSON.parse(event.body || "{}");
    if (!to || !first_name) throw new Error("Missing required params: to, first_name");

    await sendTemplateEmail(to, LAUNCHING_SOON_TEMPLATE_ID, {
      first_name,
      company: company || '—',
      trade: trade || 'your industry',
      app_base_url: appBaseUrl
    }, false);
    
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e: any) {
    return { statusCode: 400, body: JSON.stringify({ error: e.message }) };
  }
};
