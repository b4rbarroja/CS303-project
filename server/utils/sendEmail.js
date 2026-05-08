// sendEmail.js
import nodeMailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
  const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST,
    service: process.env.SMTP_SERVICE,
    port: Number(process.env.SMTP_PORT),   // ensure it's a number
    secure: true,                         // true for 465, false for others
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject,
    html: message,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Nodemailer error details:", error);
    throw error; // re-throw so the controller can handle it
  }
};
