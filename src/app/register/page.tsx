import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'
import { EMAIL_VERIFICATION_ENABLED } from '@/lib/flags'
import { RegisterForm } from './RegisterForm'

export default function RegisterPage() {
  async function registerAction(
    _prevState: { error?: string; success?: boolean } | null,
    formData: FormData
  ) {
    'use server'
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!name || !email || !password || !confirmPassword) {
      return { error: 'All fields are required.' }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { error: 'Please enter a valid email address.' }
    }

    if (password !== confirmPassword) {
      return { error: 'Passwords do not match.' }
    }

    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters.' }
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return { error: 'An account with this email already exists.' }
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: EMAIL_VERIFICATION_ENABLED ? null : new Date(),
      },
    })

    if (EMAIL_VERIFICATION_ENABLED) {
      const token = randomBytes(32).toString('hex')
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      await prisma.verificationToken.create({
        data: { identifier: email, token, expires },
      })

      try {
        await sendVerificationEmail(email, token)
      } catch (err) {
        console.error('[register] email send failed:', err)
        return { error: 'Account created but failed to send verification email. Please contact support.' }
      }
    }

    return { success: true, verified: !EMAIL_VERIFICATION_ENABLED }
  }

  return <RegisterForm registerAction={registerAction} />
}
