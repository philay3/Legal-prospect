import "server-only";
import { Resend } from "resend";

/**
 * Sends a one-time login code to the user via Resend.
 */
export async function sendLoginCodeEmail(email: string, code: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.AUTH_EMAIL_FROM;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set.");
  }
  if (!from) {
    throw new Error("AUTH_EMAIL_FROM environment variable is not set.");
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: "Your login code",
    text: `Your login code is: ${code}\n\nThis code will expire in 10 minutes.`,
  });

  if (error) {
    throw new Error(`Resend email delivery failed: ${error.message}`);
  }
}
