export function getStaffCreationEmail(
    firstName: string,
    email: string,
    temporaryPassword: string,
    position: string,
    businessName: string,
    loginUrl: string = "http://avsph-hub.vercel.app/login",
): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Account Has Been Created</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; color: #333333;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5; padding: 40px 0;">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden; margin: 0 20px;">
                    <tr>
                        <td style="padding: 40px 40px 20px 40px;">
                            <h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 600; color: #18181b;">Welcome to ${businessName}</h1>
                            <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #52525b;">
                                Hi ${firstName},
                            </p>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #52525b;">
                                An account has been created for you on the <strong>${businessName}</strong> dashboard. You have been added as <strong>${position}</strong>. Please log in using the credentials below and change your password immediately.
                            </p>

                            <!-- Credentials -->
                            <div style="background-color: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 6px; padding: 24px; margin-bottom: 32px;">
                                <p style="margin: 0 0 16px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #71717a; letter-spacing: 0.05em;">Your Login Credentials</p>
                                <p style="margin: 0 0 12px; font-size: 15px; color: #3f3f46;">
                                    <strong>Email:</strong> <span style="color: #18181b;">${email}</span>
                                </p>
                                <p style="margin: 0; font-size: 15px; color: #3f3f46;">
                                    <strong>Temporary Password:</strong> <code style="background-color: #e4e4e7; padding: 4px 8px; border-radius: 4px; color: #18181b; font-size: 14px; font-weight: 600;">${temporaryPassword}</code>
                                </p>
                            </div>

                            <!-- CTA Button -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 32px;">
                                <tr>
                                    <td align="center">
                                        <a href="${loginUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 16px; font-weight: 500; text-decoration: none; padding: 12px 32px; border-radius: 6px;">Log In to Dashboard</a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Warning -->
                            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px; margin-bottom: 32px;">
                                <p style="margin: 0; font-size: 14px; color: #991b1b; line-height: 1.5;">
                                    <strong>Important:</strong> Please change your password immediately after your first login to secure your account.
                                </p>
                            </div>

                            <!-- Next Steps -->
                            <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #18181b;">What's next?</h2>
                            <ul style="margin: 0 0 32px; padding: 0 0 0 20px; font-size: 15px; line-height: 1.6; color: #52525b;">
                                <li style="margin-bottom: 8px;">Log in using the credentials above</li>
                                <li style="margin-bottom: 8px;">Change your temporary password</li>
                                <li>Complete your profile and start submitting your daily EOD reports</li>
                            </ul>

                            <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #52525b;">
                                We're excited to have you on board!<br>
                                <strong style="color: #18181b;">The ${businessName} Team</strong>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f4f4f5; border-top: 1px solid #e4e4e7; padding: 24px 40px;">
                            <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #71717a; text-align: center;">
                                This email was sent from Advanced Virtual Staff PH. If you did not expect this email, please contact your system administrator.
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
