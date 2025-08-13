import { Handler } from "@netlify/functions";
import { sendTemplateEmail, appBaseUrl } from "./lib/email";

const WELCOME_TEMPLATE_ID = Number(process.env.WELCOME_TEMPLATE_ID);

export const handler: Handler = async (event) => {
  try {
    const { to, first_name, email, company } = JSON.parse(event.body || "{}");
    if (!to || !first_name || !email) throw new Error("Missing params");
    await sendTemplateEmail(to, WELCOME_TEMPLATE_ID, {
      first_name, email, company, app_base_url: appBaseUrl
    }, true);
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e:any) {
    return { statusCode: 400, body: JSON.stringify({ error: e.message }) };
  }
};
