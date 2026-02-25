import fp from "fastify-plugin";
import { google } from "googleapis";
const gmailPlugin = async (fastify) => {
    const oAuth2Client = new google.auth.OAuth2(fastify.config.GMAIL_CLIENT_ID, fastify.config.GMAIL_CLIENT_SECRET, fastify.config.GMAIL_REDIRECT_URI);
    oAuth2Client.setCredentials({
        refresh_token: fastify.config.GMAIL_REFRESH_TOKEN,
    });
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
    const gmailService = {
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
//# sourceMappingURL=gmail.js.map