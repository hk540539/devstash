import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { getItemsByType, getTypeLabelFromSlug } from '@/lib/db/items'
import { ItemCard } from '@/components/items/ItemCard'

export default async function ItemsByTypePage({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type } = await params

  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const label = getTypeLabelFromSlug(type)
  if (!label) notFound()

  const items = await getItemsByType(session.user.id, type)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{label}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No {label.toLowerCase()} yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}