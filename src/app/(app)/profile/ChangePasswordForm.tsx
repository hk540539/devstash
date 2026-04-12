'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ChangePasswordFormProps {
  changePasswordAction: (
    prevState: { error?: string; success?: boolean } | null,
    formData: FormData
  ) => Promise<{ error?: string; success?: boolean } | null>
}

export function ChangePasswordForm({ changePasswordAction }: ChangePasswordFormProps) {
  const [state, formAction, pending] = useActionState(changePasswordAction, null)

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400">
          Password updated successfully.
        </p>
      )}
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="currentPassword">Current password</label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="newPassword">New password</label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="confirmPassword">Confirm new password</label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? 'Updating…' : 'Update password'}
      </Button>
    </form>
  )
}
