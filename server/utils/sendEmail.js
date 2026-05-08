// utils/sendEmail.js
export const sendEmail = async ({ email, subject, message }) => {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const FROM_EMAIL = process.env.BREVO_FROM_EMAIL;

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { email: FROM_EMAIL },
      to: [{ email }],
      subject,
      htmlContent: message,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Brevo API error:', error);
    throw new Error(`Email sending failed: ${JSON.stringify(error)}`);
  }
};
