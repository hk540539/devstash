'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { GitBranch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SignInFormProps {
  callbackUrl: string
  credentialsAction: (
    prevState: { error: string } | null,
    formData: FormData
  ) => Promise<{ error: string } | null>
  githubAction: (formData: FormData) => Promise<void>
}

export function SignInForm({ callbackUrl, credentialsAction, githubAction }: SignInFormProps) {
  const [state, formAction, pending] = useActionState(credentialsAction, null)

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            S
          </div>
          <h1 className="text-2xl font-bold">Sign in to DevStash</h1>
          <p className="text-sm text-muted-foreground">Your developer knowledge hub</p>
        </div>

        {/* GitHub */}
        <form action={githubAction}>
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <Button variant="outline" className="w-full" type="submit">
            <GitBranch className="mr-2 h-4 w-4" />
            Sign in with GitHub
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Credentials form */}
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          {state?.error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" htmlFor="password">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
