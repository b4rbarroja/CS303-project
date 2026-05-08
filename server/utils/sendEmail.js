import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendEmail = async ({ email, subject, message }) => {
    try {
        const info = await transporter.sendMail({
            from: `"E-Library" <${process.env.SMTP_MAIL}>`,
            to: email,
            subject,
            html: message,
        });

        console.log("Email sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("Email Error:", error);
        throw new Error(error.message);
    }
};
