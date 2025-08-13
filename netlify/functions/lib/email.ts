import * as postmark from "postmark";

const required = (name: string, v?: string) => {
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
};

const POSTMARK_TOKEN = required("POSTMARK_TOKEN", process.env.POSTMARK_TOKEN);
const POSTMARK_FROM = required("POSTMARK_FROM", process.env.POSTMARK_FROM);
const APP_BASE_URL  = required("APP_BASE_URL", process.env.APP_BASE_URL);
const COMPANY_NAME  = required("COMPANY_NAME", process.env.COMPANY_NAME);

export const emailClient = new postmark.ServerClient(POSTMARK_TOKEN);
export const fromAddress = POSTMARK_FROM;
export const appBaseUrl  = APP_BASE_URL;
export const companyName = COMPANY_NAME;

type TemplateModel = Record<string, any>;

export async function sendTemplateEmail(
  to: string,
  templateId: number | string,
  model: TemplateModel
) {
  return emailClient.sendEmailWithTemplate({
    From: fromAddress,
    To: to,
    TemplateId: Number(templateId),
    TemplateModel: model,
    MessageStream: "outbound"
  });
}
