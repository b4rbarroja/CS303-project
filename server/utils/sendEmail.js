import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ email, subject, message }) => {
  await resend.emails.send({
    from: "E-Library <onboarding@resend.dev>",
    to: email,
    subject,
    html: message, 
  });
};
