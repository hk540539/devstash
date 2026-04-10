import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { ResetPasswordForm } from './ResetPasswordForm'

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams

  if (!token) {
    redirect('/forgot-password')
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } })

  if (!record || !record.identifier.startsWith('password-reset:') || record.expires < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold mx-auto">
            S
          </div>
          <h1 className="text-2xl font-bold">Link invalid or expired</h1>
          <p className="text-sm text-muted-foreground">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <a
            href="/forgot-password"
            className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Request new link
          </a>
        </div>
      </div>
    )
  }

  async function resetPasswordAction(
    _prevState: { error?: string; success?: boolean } | null,
    formData: FormData
  ) {
    'use server'
    const token = formData.get('token') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!password || !confirmPassword) {
      return { error: 'All fields are required.' }
    }

    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters.' }
    }

    if (password !== confirmPassword) {
      return { error: 'Passwords do not match.' }
    }

    const record = await prisma.verificationToken.findUnique({ where: { token } })

    if (!record || !record.identifier.startsWith('password-reset:') || record.expires < new Date()) {
      return { error: 'This reset link is invalid or has expired. Please request a new one.' }
    }

    const email = record.identifier.replace('password-reset:', '')
    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      }),
      prisma.verificationToken.delete({ where: { token } }),
    ])

    return { success: true }
  }

  return <ResetPasswordForm token={token} resetPasswordAction={resetPasswordAction} />
}
