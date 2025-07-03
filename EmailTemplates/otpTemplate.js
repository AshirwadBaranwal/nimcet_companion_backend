export const generateOTPEmail = (otp) => `
  <div style="max-width: 500px; margin: auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #fefefe;">
    <h2 style="color: #28a745; text-align: center; margin-bottom: 20px;">Verification Code</h2>

    <p style="font-size: 16px;">Dear User,</p>
    <p style="font-size: 16px;">Your verification code is:</p>

    <div style="text-align: center; margin: 20px 0;">
      <span style="display: inline-block; font-size: 28px; font-weight: bold; background-color: #e8f5e9; color: #2e7d32; padding: 10px 20px; border-radius: 6px;">
        ${otp}
      </span>
    </div>

    <p style="font-size: 14px; color: #555;">
      Please use this code to verify your email address. The code will expire in 10 minutes.
    </p>

    <p style="font-size: 14px; color: #777;">
      If you did not request this, please ignore this email.
    </p>

    <br />

    <p style="font-size: 14px;">Thank you,<br>nimcetcompanion Team</p>

    <p style="font-size: 12px; color: #999; border-top: 1px solid #ddd; padding-top: 10px;">
      This is an automated message. Please do not reply to this email.
    </p>
  </div>
`;
