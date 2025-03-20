import nodemailer, { SentMessageInfo } from 'nodemailer'
import { emailConfig, env } from '../../config/config'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

const sendEmail = async ({
  to,
  subject,
  html,
}: EmailOptions): Promise<SentMessageInfo> => {
  const transporter = nodemailer.createTransport(emailConfig)

  return transporter.sendMail({
    from: '"Node Starter" <nodestarter@gmail.com>',
    to,
    subject,
    html,
  })
}

interface ResetPasswordEmailParams {
  name: string
  email: string
  token: string
  origin: string
}

const sendResetPasswordEmail = async ({
  name,
  email,
  token,
  origin,
}: ResetPasswordEmailParams): Promise<SentMessageInfo> => {
  const resetURL = `${origin}/user/reset-password?token=${token}&email=${email}`
  const message = `<p>Please reset password by clicking on the following link: 
  <a href="${resetURL}">Reset Password</a></p>`

  return sendEmail({
    to: email,
    subject: 'Reset Password',
    html: `<h4>Hello, ${name}</h4>
   ${message}
   `,
  })
}

export default sendResetPasswordEmail

interface VerificationEmailParams {
  name: string
  email: string
  verificationToken: string
  origin?: string
}

const sendVerificationEmail = async ({
  name,
  email,
  verificationToken,
  origin = env.ORIGIN,
}: VerificationEmailParams): Promise<SentMessageInfo> => {
  const verifyEmail = `${origin}/user/verify-email?token=${verificationToken}&email=${email}`

  const message = `<p>Please confirm your email by clicking on the following link: 
  <a href="${verifyEmail}">Verify Email</a> </p>`

  return sendEmail({
    to: email,
    subject: 'Email Confirmation',
    html: `<h4> Hello, ${name}</h4>
    ${message}
    `,
  })
}
export { sendEmail, sendResetPasswordEmail, sendVerificationEmail }
