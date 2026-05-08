import nodeMailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
  const transporter = nodeMailer.createTransport({
    service: "gmail", // استخدام service بيظبط الـ host والـ port والـ secure تلقائياً
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD, // لازم يكون App Password من إعدادات حساب جوجل
    },
  });

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject,
    html: message,
  };

  await transporter.sendMail(mailOptions);
};
