import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { google } from "googleapis";
import type { gmail_v1 } from "googleapis";

export interface GmailService {
  /**
   * Send an email via the Gmail API using OAuth2.
   * @param to - Recipient email address
   * @param subject - Email subject line
   * @param body - Email body (HTML supported)
   * @param from - Optional sender override (defaults to authenticated Gmail user)
   */
  sendEmail: (options: {
    to: string;
    subject: string;
    body: string;
    from?: string;
  }) => Promise<gmail_v1.Schema$Message>;
}

const gmailPlugin: FastifyPluginAsync = async (fastify) => {
  const oAuth2Client = new google.auth.OAuth2(
    fastify.config.GMAIL_CLIENT_ID,
    fastify.config.GMAIL_CLIENT_SECRET,
    fastify.config.GMAIL_REDIRECT_URI,
  );

  oAuth2Client.setCredentials({
    refresh_token: fastify.config.GMAIL_REFRESH_TOKEN,
  });

  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

  const gmailService: GmailService = {
    async sendEmail({ to, subject, body, from }) {
      // Build the MIME message
      const senderLine = from ? `From: ${from}` : "";
      const messageParts = [
        senderLine,
        `To: ${to}`,
        "Content-Type: text/html; charset=utf-8",
        "MIME-Version: 1.0",
        `Subject: ${subject}`,
        "",
        body,
      ].filter(Boolean);

      const rawMessage = messageParts.join("\r\n");

      // Base64url encode the message
      const encodedMessage = Buffer.from(rawMessage)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const result = await gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: encodedMessage,
        },
      });

      return result.data;
    },
  };

  fastify.decorate("gmail", gmailService);

  fastify.log.info("Gmail API plugin initialized with OAuth2");
};

export default fp(gmailPlugin, {
  name: "gmail",
  dependencies: ["env"],
});

// Extend FastifyInstance to include gmail service
declare module "fastify" {
  interface FastifyInstance {
    gmail: GmailService;
  }
}
