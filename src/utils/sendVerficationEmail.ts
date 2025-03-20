import sendEmail from './sendEmail'
import { env } from '../../config/config'
import { SentMessageInfo } from 'nodemailer'

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

export default sendVerificationEmail
