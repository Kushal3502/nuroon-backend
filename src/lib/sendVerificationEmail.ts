import { transporter } from '../config/nodemailer';

export const sentVerificationEmail = async (email: string, code: string) => {
  console.log({
    email,
    code,
  });

  const mailOptions = {
    from: `"Nuroon" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your email',
    html: `
      <h2>Verify Your Email</h2>
      <p>Your verification code is:</p>
      <h3 style="color: #007bff;">${code}</h3>
      <p>This code will expire in 10 minutes.</p>
    `,
  };

  const { response } = await transporter.sendMail(mailOptions);

  console.log(response);

  console.log('Email sent');
};
