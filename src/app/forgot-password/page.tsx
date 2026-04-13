import { randomBytes } from 'crypto'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import { rateLimit, getIPFromHeaders, rateLimitMessage } from '@/lib/rate-limit'
import { ForgotPasswordForm } from './ForgotPasswordForm'

export default function ForgotPasswordPage() {
  async function forgotPasswordAction(
    _prevState: { error?: string; success?: boolean } | null,
    formData: FormData
  ) {
    'use server'
    const ip = getIPFromHeaders(await headers())
    const rl = await rateLimit('forgotPassword', ip)
    if (!rl.success) {
      return { error: rateLimitMessage(rl.reset) }
    }

    const email = (formData.get('email') as string)?.trim().toLowerCase()

    if (!email) {
      return { error: 'Email is required.' }
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    })

    // Always return success to avoid user enumeration
    if (!user || !user.password) {
      return { success: true }
    }

    // Delete any existing reset token for this email before creating a new one
    await prisma.verificationToken.deleteMany({
      where: { identifier: `password-reset:${email}` },
    })

    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.verificationToken.create({
      data: { identifier: `password-reset:${email}`, token, expires },
    })

    try {
      await sendPasswordResetEmail(email, token)
    } catch (err) {
      console.error('[forgot-password] email send failed:', err)
    }

    return { success: true }
  }

  return <ForgotPasswordForm forgotPasswordAction={forgotPasswordAction} />
}
