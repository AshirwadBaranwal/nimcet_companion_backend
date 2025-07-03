import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "nimcetcompanion@gmail.com", //❌ need changes
    pass: "tojzxyhtnfdzlsyz", //❌ need changes
  },
});

export const sendEmail = async (to, subject, html) => {
  try {
    if (!to || !subject || !html) {
      throw new Error("Missing required fields for email");
    }

    const mailOptions = {
      from: "noReply@nimcetcompanion",
      to,
      subject,
      html,
      text: html.replace(/<[^>]+>/g, ""),
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent to ${to}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    return false;
  }
};
