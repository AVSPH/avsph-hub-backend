import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { Resend } from "resend";

export interface ResendService {
  sendEmail: (options: {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
  }) => Promise<{ id: string }>;
}

const resendPlugin: FastifyPluginAsync = async (fastify) => {
  const resend = new Resend(fastify.config.RESEND_API_KEY);

  const defaultFrom = fastify.config.RESEND_FROM;

  const resendService: ResendService = {
    async sendEmail({ to, subject, html, from }) {
      const { data, error } = await resend.emails.send({
        from: from ?? defaultFrom,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      });

      if (error) {
        throw new Error(`Resend error: ${error.message}`);
      }

      return { id: data!.id };
    },
  };

  fastify.decorate("resend", resendService);

  fastify.log.info("Resend plugin initialized");
};

export default fp(resendPlugin, {
  name: "resend",
  dependencies: ["env"],
});

declare module "fastify" {
  interface FastifyInstance {
    resend: ResendService;
  }
}
