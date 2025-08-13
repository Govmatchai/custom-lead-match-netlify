import { Handler } from "@netlify/functions";
import { sendTemplateEmail, appBaseUrl } from "./lib/email";
import { supabaseAdmin } from "./lib/supabase";

const PASSWORD_RESET_TEMPLATE_ID = Number(process.env.PASSWORD_RESET_TEMPLATE_ID);

export const handler: Handler = async (event) => {
  try {
    const { email } = JSON.parse(event.body || "{}");
    if (!email) throw new Error("Missing email");

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: `${appBaseUrl}/reset-password` }
    });
    if (error || !data) throw new Error(error?.message || "Failed to generate link");
    const resetUrl = data.properties?.action_link || data.action_link;

    await sendTemplateEmail(email, PASSWORD_RESET_TEMPLATE_ID, {
      email, reset_url: resetUrl, app_base_url: appBaseUrl
    });
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e:any) {
    return { statusCode: 400, body: JSON.stringify({ error: e.message }) };
  }
};
