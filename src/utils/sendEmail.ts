import nodemailer, { SentMessageInfo } from 'nodemailer'
import { emailConfig } from '../../config/config'

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

export default sendEmail
