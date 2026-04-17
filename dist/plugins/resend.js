import fp from "fastify-plugin";
import { Resend } from "resend";
const resendPlugin = async (fastify) => {
    const resend = new Resend(fastify.config.RESEND_API_KEY);
    const defaultFrom = fastify.config.RESEND_FROM;
    const resendService = {
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
            return { id: data.id };
        },
    };
    fastify.decorate("resend", resendService);
    fastify.log.info("Resend plugin initialized");
};
export default fp(resendPlugin, {
    name: "resend",
    dependencies: ["env"],
});
//# sourceMappingURL=resend.js.map