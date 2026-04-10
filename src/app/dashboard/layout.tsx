import { redirect } from 'next/navigation'
import { auth, signOut } from '@/auth'
import { getCollections } from '@/lib/db/collections'
import { getSidebarItemTypes } from '@/lib/db/items'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const { id, name, email, image } = session.user

  const [itemTypes, collections] = await Promise.all([
    getSidebarItemTypes(id),
    getCollections(id),
  ])

  async function signOutAction() {
    'use server'
    await signOut({ redirectTo: '/sign-in' })
  }

  return (
    <DashboardLayout
      itemTypes={itemTypes}
      collections={collections}
      user={{ name: name ?? email ?? 'User', email: email ?? '', image }}
      signOutAction={signOutAction}
    >
      {children}
    </DashboardLayout>
  )
}
