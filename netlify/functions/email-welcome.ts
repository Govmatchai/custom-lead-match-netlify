import { Handler } from "@netlify/functions";
import { sendTemplateEmail, appBaseUrl } from "./lib/email";
import { supabaseAdmin } from "./lib/supabase";

const WELCOME_TEMPLATE_ID = Number(process.env.WELCOME_TEMPLATE_ID);

export const handler: Handler = async (event) => {
  try {
    const { to, first_name, email, company, needs_password_setup } = JSON.parse(event.body || "{}");
    if (!to || !email) throw new Error("Missing required params: to, email");

    const templateModel: any = {
      first_name: first_name || 'there',
      email,
      company: company || '—',
      app_base_url: appBaseUrl
    };

    if (needs_password_setup) {
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: "invite",
        email,
        options: { redirectTo: `${appBaseUrl}/login` }
      });
      
      if (error) {
        console.warn('Failed to generate invite link:', error);
      } else {
        const setPasswordUrl = data?.properties?.action_link;
        if (setPasswordUrl) {
          templateModel.set_password_url = setPasswordUrl;
        }
      }
    }

    await sendTemplateEmail(to, WELCOME_TEMPLATE_ID, templateModel, false);
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e:any) {
    return { statusCode: 400, body: JSON.stringify({ error: e.message }) };
  }
};
