import type { FastifyPluginAsync } from "fastify";
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
declare const _default: FastifyPluginAsync;
export default _default;
declare module "fastify" {
    interface FastifyInstance {
        gmail: GmailService;
    }
}
//# sourceMappingURL=gmail.d.ts.map