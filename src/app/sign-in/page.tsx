import { AuthError } from 'next-auth'
import { headers } from 'next/headers'
import { signIn } from '@/auth'
import { rateLimit, getIPFromHeaders, rateLimitMessage } from '@/lib/rate-limit'
import { SignInForm } from './SignInForm'

interface SignInPageProps {
  searchParams: Promise<{ callbackUrl?: string }>
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { callbackUrl = '/dashboard' } = await searchParams

  async function credentialsAction(
    _prevState: { error: string } | null,
    formData: FormData
  ) {
    'use server'
    const email = (formData.get('email') as string)?.trim().toLowerCase() ?? ''
    const ip = getIPFromHeaders(await headers())
    const rl = await rateLimit('login', `${ip}:${email}`)
    if (!rl.success) {
      return { error: rateLimitMessage(rl.reset) }
    }

    const redirectTo = (formData.get('callbackUrl') as string) || '/dashboard'
    try {
      await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirectTo,
      })
    } catch (error) {
      if (error instanceof AuthError) {
        const cause = error.cause as { err?: Error } | undefined
        if (cause?.err?.message === 'EMAIL_NOT_VERIFIED') {
          return { error: 'Please verify your email before signing in.' }
        }
        return { error: 'Invalid email or password.' }
      }
      throw error
    }
    return null
  }

  async function githubAction(formData: FormData) {
    'use server'
    const redirectTo = (formData.get('callbackUrl') as string) || '/dashboard'
    await signIn('github', { redirectTo })
  }

  return (
    <SignInForm
      callbackUrl={callbackUrl}
      credentialsAction={credentialsAction}
      githubAction={githubAction}
    />
  )
}
