import { prisma } from '@/lib/prisma'
import { getCollections } from '@/lib/db/collections'
import { getSidebarItemTypes } from '@/lib/db/items'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

export default async function Layout({ children }: { children: React.ReactNode }) {
  // TODO: replace with session.user.id once auth is set up
  const demoUser = await prisma.user.findUnique({
    where: { email: 'hk540539@gmail.com' },
    select: { id: true, email: true },
  })

  const [itemTypes, collections] = await Promise.all([
    demoUser ? getSidebarItemTypes(demoUser.id) : [],
    demoUser ? getCollections(demoUser.id) : [],
  ])

  return (
    <DashboardLayout
      itemTypes={itemTypes}
      collections={collections}
      user={{ name: 'HK', email: demoUser?.email ?? '' }}
    >
      {children}
    </DashboardLayout>
  )
}
