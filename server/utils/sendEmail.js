import Brevo from "@getbrevo/brevo";
import dotenv from "dotenv";

dotenv.config();

const apiInstance = new Brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);

export const sendEmail = async ({ email, subject, message }) => {
    try {
        const sendSmtpEmail = new Brevo.SendSmtpEmail();

        sendSmtpEmail.sender = {
            name: process.env.MAIL_FROM_NAME,
            email: process.env.MAIL_FROM,
        };

        sendSmtpEmail.to = [
            {
                email: email,
            },
        ];

        sendSmtpEmail.subject = subject;

        sendSmtpEmail.htmlContent = message;

        const info = await apiInstance.sendTransacEmail(
            sendSmtpEmail
        );

        console.log("Email sent:", info);

        return info;
    } catch (error) {
        console.error("Email Error:", error);

        throw new Error(
            error.response?.body?.message || error.message
        );
    }
};
