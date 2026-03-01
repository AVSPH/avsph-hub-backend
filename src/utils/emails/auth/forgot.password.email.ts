export function getForgotPasswordEmail(
    firstName: string,
    resetCode: string,
    role: "Admin" | "Staff" = "Admin",
): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; color: #333333;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5; padding: 40px 0;">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden; margin: 0 20px;">
                    <tr>
                        <td style="padding: 40px 40px 20px 40px;">
                            <h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 600; color: #18181b;">Reset Your Password</h1>
                            <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #52525b;">
                                Hi ${firstName},
                            </p>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #52525b;">
                                We received a request to reset your ${role.toLowerCase()} account password. Use the verification code below to proceed. This code is valid for <strong>15 minutes</strong>.
                            </p>

                            <!-- Reset Code -->
                            <div style="background-color: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 6px; padding: 32px 24px; text-align: center; margin-bottom: 24px;">
                                <p style="margin: 0 0 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #71717a; letter-spacing: 0.05em;">Your Verification Code</p>
                                <p style="margin: 0; font-size: 36px; font-weight: 700; color: #18181b; letter-spacing: 0.2em; font-family: monospace;">
                                    ${resetCode}
                                </p>
                            </div>

                            <p style="margin: 0 0 32px; font-size: 15px; line-height: 1.6; color: #52525b;">
                                Enter this code on the password reset page along with your new password.
                            </p>

                            <!-- Security Tips -->
                            <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #18181b;">Security Reminders</h2>
                            <ul style="margin: 0 0 32px; padding: 0 0 0 20px; font-size: 15px; line-height: 1.6; color: #52525b;">
                                <li style="margin-bottom: 8px;">Never share this code with anyone</li>
                                <li style="margin-bottom: 8px;">Our team will never ask for your password</li>
                                <li>This code will expire in 15 minutes</li>
                            </ul>

                            <!-- Warning -->
                            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                                <p style="margin: 0; font-size: 14px; color: #991b1b; line-height: 1.5;">
                                    <strong>Didn't request this?</strong> If you did not request a password reset, please ignore this email. Your account remains secure.
                                </p>
                            </div>

                            <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #52525b;">
                                Best regards,<br>
                                <strong style="color: #18181b;">Advanced Virtual Staff PH</strong>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f4f4f5; border-top: 1px solid #e4e4e7; padding: 24px 40px;">
                            <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #71717a; text-align: center;">
                                This email was sent from Advanced Virtual Staff PH. If you have any concerns, please contact your system administrator.
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
