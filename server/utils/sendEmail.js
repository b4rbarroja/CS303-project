// utils/sendEmail.js
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async ({ email, subject, message }) => {
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL, // "E-Library <nerdodredo@gmail.com>" also works
    subject,
    html: message,
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent via SendGrid');
  } catch (error) {
    console.error('SendGrid error:', error.response?.body || error);
    throw error;
  }
};
