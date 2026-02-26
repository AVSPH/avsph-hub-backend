export function getForgotPasswordEmail(firstName, resetCode, role = "Admin") {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f7fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f7fa;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">

                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                Password Reset
                            </h1>
                            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 15px;">
                                AVS Dashboard ${role}
                            </p>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px; color: #1a202c; font-size: 18px; font-weight: 600;">
                                Hi ${firstName},
                            </p>

                            <p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                We received a request to reset your ${role.toLowerCase()} account password. Use the verification code below to proceed. This code is valid for <strong style="color: #667eea;">15 minutes</strong>.
                            </p>

                            <!-- Reset Code Box -->
                            <div style="background: linear-gradient(135deg, #f7f0ff 0%, #eef2ff 100%); border: 2px dashed #764ba2; border-radius: 12px; padding: 32px 20px; text-align: center; margin: 28px 0;">
                                <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                                    Your Reset Code
                                </p>
                                <p style="margin: 0; color: #4c1d95; font-size: 48px; font-weight: 800; letter-spacing: 12px; font-family: 'Courier New', Courier, monospace;">
                                    ${resetCode}
                                </p>
                            </div>

                            <p style="margin: 0 0 24px; color: #4a5568; font-size: 15px; line-height: 1.6;">
                                Enter this code on the password reset page along with your new password.
                            </p>

                            <!-- Warning Box -->
                            <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 16px 20px; border-radius: 4px; margin: 24px 0;">
                                <p style="margin: 0; color: #9a3412; font-size: 14px; line-height: 1.5;">
                                    <strong>⚠️ Didn't request this?</strong> If you did not request a password reset, please ignore this email. Your account remains secure and no changes have been made.
                                </p>
                            </div>

                            <!-- Security Tips -->
                            <div style="margin-top: 28px;">
                                <p style="margin: 0 0 12px; color: #1a202c; font-size: 15px; font-weight: 600;">Security reminders:</p>
                                <ul style="margin: 0; padding-left: 20px; color: #4a5568; font-size: 14px; line-height: 1.8;">
                                    <li>Never share this code with anyone</li>
                                    <li>Our team will never ask for your password</li>
                                    <li>The code expires in 15 minutes</li>
                                </ul>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 24px 30px; border-top: 1px solid #e2e8f0; text-align: center;">
                            <p style="margin: 0; color: #718096; font-size: 13px; line-height: 1.5;">
                                This email was sent by <strong>AVS Dashboard</strong>. If you have any concerns, please contact your system administrator.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `.trim();
}
//# sourceMappingURL=forgot.password.email.js.map