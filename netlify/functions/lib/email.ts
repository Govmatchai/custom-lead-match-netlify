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
  model: TemplateModel,
  includeLogoAttachment: boolean = false
) {
  const emailOptions: any = {
    From: fromAddress,
    To: to,
    TemplateId: Number(templateId),
    TemplateModel: model,
    MessageStream: "outbound"
  };

  if (includeLogoAttachment) {
    const fs = await import('fs');
    const logoPath = 'public/assets/email/clm-logo.png';
    try {
      const logoContent = await fs.promises.readFile(logoPath);
      emailOptions.Attachments = [{
        Name: "clm-logo.png",
        Content: logoContent.toString("base64"),
        ContentType: "image/png",
        ContentID: "cid:clm-logo"
      }];
    } catch (error) {
      console.warn('Logo attachment failed, using HTTPS fallback:', error);
    }
  }

  return emailClient.sendEmailWithTemplate(emailOptions);
}
