import { Handler } from "@netlify/functions";
import { sendTemplateEmail, appBaseUrl } from "./lib/email";

const SUPPORT_REPLY_TEMPLATE_ID = Number(process.env.SUPPORT_REPLY_TEMPLATE_ID);

export const handler: Handler = async (event) => {
  try {
    const { to, first_name, ticket_id, snippet } = JSON.parse(event.body || "{}");
    if (!to || !first_name || !ticket_id) throw new Error("Missing params");

    await sendTemplateEmail(to, SUPPORT_REPLY_TEMPLATE_ID, {
      first_name, ticket_id, snippet, app_base_url: appBaseUrl
    });
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e:any) {
    return { statusCode: 400, body: JSON.stringify({ error: e.message }) };
  }
};
