const gmailRoutes = async (fastify) => {
    // POST /gmail/test - Send a test email via Gmail API (admin only)
    fastify.post("/gmail/test", {
        schema: {
            description: "Send a test email via the Gmail API to verify OAuth2 integration is working",
            tags: ["Gmail"],
            security: [{ bearerAuth: [] }],
            body: {
                type: "object",
                properties: {
                    to: {
                        type: "string",
                        format: "email",
                        description: "Recipient email address",
                    },
                    subject: {
                        type: "string",
                        description: "Email subject (defaults to a test subject)",
                    },
                    body: {
                        type: "string",
                        description: "Email body in HTML (defaults to a test message)",
                    },
                },
                required: ["to"],
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                        messageId: { type: "string" },
                        threadId: { type: "string" },
                    },
                },
                500: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                        details: { type: "string" },
                    },
                },
            },
        },
    }, async (request, reply) => {
        const { to, subject = "Gmail API Test - AVS Dashboard", body = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Gmail API Test Email</h2>
            <p>If you're reading this, the Gmail API OAuth2 integration is working correctly!</p>
            <p style="color: #666; font-size: 12px;">Sent at: ${new Date().toISOString()}</p>
          </div>
        `, } = request.body;
        try {
            const result = await fastify.gmail.sendEmail({ to, subject, body });
            return {
                message: "Test email sent successfully",
                messageId: result.id || "",
                threadId: result.threadId || "",
            };
        }
        catch (err) {
            fastify.log.error(err, "Gmail API test email failed");
            return reply.status(500).send({
                error: "Failed to send test email",
                details: err instanceof Error ? err.message : "Unknown error occurred",
            });
        }
    });
};
export default gmailRoutes;
//# sourceMappingURL=gmail.routes.js.map