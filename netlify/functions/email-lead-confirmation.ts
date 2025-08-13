import { Handler } from "@netlify/functions";
import { sendTemplateEmail, appBaseUrl } from "./lib/email";

const LEAD_PURCHASE_TEMPLATE_ID = Number(process.env.LEAD_PURCHASE_TEMPLATE_ID);

export const handler: Handler = async (event) => {
  try {
    const { to, first_name, service_category, city, state, summary, lead_id, new_balance } =
      JSON.parse(event.body || "{}");
    if (!to || !first_name || !lead_id) throw new Error("Missing params");

    await sendTemplateEmail(to, LEAD_PURCHASE_TEMPLATE_ID, {
      first_name, service_category, city, state, summary, lead_id, new_balance,
      app_base_url: appBaseUrl
    }, true);
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e:any) {
    return { statusCode: 400, body: JSON.stringify({ error: e.message }) };
  }
};
