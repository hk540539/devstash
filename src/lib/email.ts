import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.AUTH_URL}/verify-email?token=${token}`

  const { error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Verify your DevStash email',
    html: `
      <p>Thanks for signing up for DevStash!</p>
      <p>Click the link below to verify your email address:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link expires in 24 hours.</p>
      <p>If you did not create an account, you can ignore this email.</p>
    `,
  })

  if (error) {
    throw new Error(`Resend error: ${error.message}`)
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.AUTH_URL}/reset-password?token=${token}`

  const { error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Reset your DevStash password',
    html: `
      <p>You requested a password reset for your DevStash account.</p>
      <p>Click the link below to set a new password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  })

  if (error) {
    throw new Error(`Resend error: ${error.message}`)
  }
}
