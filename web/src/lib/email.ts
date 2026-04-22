import { Resend } from "resend";
import { serverEnv } from "@/lib/env";

/**
 * Transactional email helper. Uses Resend if RESEND_API_KEY is configured; in
 * development without a key, logs to stdout so the flow is still debuggable.
 */

function client() {
  if (!serverEnv.RESEND_API_KEY) return null;
  return new Resend(serverEnv.RESEND_API_KEY);
}

export async function sendParentConsentEmail(opts: {
  to: string;
  parentName: string;
  childName: string;
  confirmUrl: string;
  supportEmail: string;
}) {
  const subject = `Approve ${opts.childName}'s access to Lessons Mama Never Taught Me`;
  const text = [
    `Hello ${opts.parentName},`,
    ``,
    `${opts.childName} would like to read "Lessons Mama Never Taught Me" by Dr. Karen R. January.`,
    `This book contains graphic language and explicit adult material, so we're asking for your consent before granting access.`,
    ``,
    `To approve, please click the secure link below:`,
    opts.confirmUrl,
    ``,
    `If you did not expect this request, you can ignore this email — no access will be granted.`,
    ``,
    `Questions? Write to ${opts.supportEmail}.`,
    ``,
    `— January Media LLC`,
  ].join("\n");

  const resend = client();
  if (!resend) {
    console.log(`[email:dev] to=${opts.to} subject=${subject}\n${text}`);
    return;
  }
  await resend.emails.send({
    from: `Dr. Karen R. January <${opts.supportEmail}>`,
    to: opts.to,
    subject,
    text,
  });
}
