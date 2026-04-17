import type { FastifyPluginAsync } from "fastify";
export interface ResendService {
    sendEmail: (options: {
        to: string | string[];
        subject: string;
        html: string;
        from?: string;
    }) => Promise<{
        id: string;
    }>;
}
declare const _default: FastifyPluginAsync;
export default _default;
declare module "fastify" {
    interface FastifyInstance {
        resend: ResendService;
    }
}
//# sourceMappingURL=resend.d.ts.map