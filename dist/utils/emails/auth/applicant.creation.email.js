/**
 * Welcome email sent to a newly hired applicant who has been
 * converted to a staff member in the AVS Dashboard.
 */
export function getApplicantHiredEmail(firstName, email, temporaryPassword, position, businessName, loginUrl = "https://dashboard.advancedvirtualstaff.com/login") {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to the Team!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f7fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f7fa;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">

                    <!-- Header with gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                🎉 Welcome to the Team!
                            </h1>
                            <p style="margin: 12px 0 0; color: rgba(255,255,255,0.85); font-size: 16px;">
                                You've been hired as <strong>${position}</strong>
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
                                Congratulations! We're thrilled to welcome you to <strong style="color: #667eea;">${businessName}</strong>. Your account on the AVS Dashboard has been created and is ready to use.
                            </p>

                            <!-- Credentials Box -->
                            <div style="background: linear-gradient(135deg, #f7f0ff 0%, #eef2ff 100%); border: 2px solid #764ba2; border-radius: 12px; padding: 28px 24px; margin: 28px 0;">
                                <p style="margin: 0 0 16px; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; text-align: center;">
                                    Your Login Credentials
                                </p>
                                <table role="presentation" style="width: 100%;">
                                    <tr>
                                        <td style="padding: 8px 0;">
                                            <span style="color: #6b7280; font-size: 14px; font-weight: 600;">Email:</span>
                                        </td>
                                        <td style="padding: 8px 0; text-align: right;">
                                            <span style="color: #4c1d95; font-size: 14px; font-weight: 600; font-family: 'Courier New', Courier, monospace;">${email}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0;">
                                            <span style="color: #6b7280; font-size: 14px; font-weight: 600;">Temporary Password:</span>
                                        </td>
                                        <td style="padding: 8px 0; text-align: right;">
                                            <span style="color: #4c1d95; font-size: 16px; font-weight: 800; font-family: 'Courier New', Courier, monospace; letter-spacing: 2px;">${temporaryPassword}</span>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Login Button -->
                            <div style="text-align: center; margin: 32px 0;">
                                <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 36px; border-radius: 8px;">
                                    Log In to Dashboard
                                </a>
                            </div>

                            <!-- Warning Box -->
                            <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 16px 20px; border-radius: 4px; margin: 24px 0;">
                                <p style="margin: 0; color: #9a3412; font-size: 14px; line-height: 1.5;">
                                    <strong>🔒 Important:</strong> Please change your password immediately after your first login for security purposes.
                                </p>
                            </div>

                            <!-- What's Next -->
                            <div style="margin: 32px 0;">
                                <h2 style="margin: 0 0 16px; color: #1a202c; font-size: 20px; font-weight: 700;">
                                    What happens next?
                                </h2>

                                <div style="margin-bottom: 16px;">
                                    <table role="presentation" style="width: 100%;">
                                        <tr>
                                            <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                                                <div style="width: 24px; height: 24px; background-color: #667eea; border-radius: 50%; color: white; font-weight: bold; font-size: 12px; text-align: center; line-height: 24px;">1</div>
                                            </td>
                                            <td style="padding-left: 12px;">
                                                <p style="margin: 0; color: #4a5568; font-size: 15px; line-height: 1.5;">
                                                    Log in using the credentials above
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </div>

                                <div style="margin-bottom: 16px;">
                                    <table role="presentation" style="width: 100%;">
                                        <tr>
                                            <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                                                <div style="width: 24px; height: 24px; background-color: #667eea; border-radius: 50%; color: white; font-weight: bold; font-size: 12px; text-align: center; line-height: 24px;">2</div>
                                            </td>
                                            <td style="padding-left: 12px;">
                                                <p style="margin: 0; color: #4a5568; font-size: 15px; line-height: 1.5;">
                                                    Change your temporary password
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </div>

                                <div>
                                    <table role="presentation" style="width: 100%;">
                                        <tr>
                                            <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                                                <div style="width: 24px; height: 24px; background-color: #667eea; border-radius: 50%; color: white; font-weight: bold; font-size: 12px; text-align: center; line-height: 24px;">3</div>
                                            </td>
                                            <td style="padding-left: 12px;">
                                                <p style="margin: 0; color: #4a5568; font-size: 15px; line-height: 1.5;">
                                                    Complete your profile and start submitting your daily EOD reports
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </div>

                            <p style="margin: 24px 0 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                We're excited to have you on board!
                            </p>

                            <p style="margin: 16px 0 0; color: #2d3748; font-size: 16px; font-weight: 600;">
                                Best regards,<br>
                                <span style="color: #667eea;">The ${businessName} Team</span>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 24px 30px; border-top: 1px solid #e2e8f0; text-align: center;">
                            <p style="margin: 0; color: #718096; font-size: 13px; line-height: 1.5;">
                                This email was sent from <strong>Advanced Virtual Staff PH</strong>. If you have any concerns, please contact your system administrator.
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
//# sourceMappingURL=applicant.creation.email.js.map