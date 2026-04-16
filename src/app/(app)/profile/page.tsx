import { redirect } from 'next/navigation'
import { KeyRound, Layers, FolderOpen, Trash2, CalendarDays, Mail, User } from 'lucide-react'
import { auth } from '@/auth'
import { getProfileUser, getProfileStats } from '@/lib/db/profile'
import { getIcon } from '@/lib/icons'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ChangePasswordForm } from './ChangePasswordForm'
import { DeleteAccountButton } from './DeleteAccountButton'
import { changePasswordAction, deleteAccountAction } from '@/actions/profile'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')
  const userId = session.user.id

  const [user, stats] = await Promise.all([
    getProfileUser(userId),
    getProfileStats(userId),
  ])

  if (!user) redirect('/sign-in')

  const displayName = user.name ?? user.email
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-4">
          {/* Avatar card */}
          <div className="rounded-lg border border-border bg-card p-6 flex flex-col items-center text-center gap-3">
            <Avatar className="h-20 w-20">
              {user.image && <AvatarImage src={user.image} alt={displayName} />}
              <AvatarFallback className="text-2xl font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              {user.name && <p className="font-semibold">{user.name}</p>}
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* Account details */}
          <div className="rounded-lg border border-border bg-card p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details</p>
            <div className="space-y-2.5">
              {user.name && (
                <div className="flex items-center gap-2.5 text-sm">
                  <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{user.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-sm">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate text-muted-foreground">{user.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">Joined {joinedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="rounded-lg border border-border bg-card p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Usage</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.totalItems}</p>
                  <p className="text-xs text-muted-foreground">Items</p>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.totalCollections}</p>
                  <p className="text-xs text-muted-foreground">Collections</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {stats.itemTypeCounts.map((type) => {
                const Icon = getIcon(type.icon)
                return (
                  <div key={type.id} className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: type.color }} />
                    <span className="flex-1 text-sm text-muted-foreground">{type.name}</span>
                    <span className="text-sm font-medium tabular-nums">{type.count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Change Password — email users only */}
          {user.hasPassword && (
            <div className="rounded-lg border border-border bg-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Change password</p>
              </div>
              <ChangePasswordForm changePasswordAction={changePasswordAction} />
            </div>
          )}

          {/* Danger Zone */}
          <div className="rounded-lg border border-destructive/30 bg-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-destructive" />
              <p className="text-xs font-semibold uppercase tracking-wider text-destructive">Danger zone</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
            <DeleteAccountButton deleteAccountAction={deleteAccountAction} />
          </div>
        </div>
      </div>
    </div>
  )
}
