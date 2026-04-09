import Link from 'next/link'
import {
  Layers,
  FolderOpen,
  Star,
  Bookmark,
  Pin,
  type LucideIcon,
} from 'lucide-react'
import { getCollections } from '@/lib/db/collections'
import { getStats, getPinnedItems, getRecentItems, type ItemWithMeta } from '@/lib/db/items'
import { getIcon } from '@/lib/icons'
import { prisma } from '@/lib/prisma'

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: LucideIcon
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function CollectionCard({
  collection,
}: {
  collection: Awaited<ReturnType<typeof getCollections>>[number]
}) {
  return (
    <div
      className="rounded-lg border bg-card p-4 flex flex-col gap-2"
      style={{ borderColor: `${collection.dominantColor}60` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-medium truncate">{collection.name}</span>
          {collection.isFavorite && (
            <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'}
      </p>
      {collection.description && (
        <p className="text-sm text-muted-foreground line-clamp-1">
          {collection.description}
        </p>
      )}
      <div className="mt-auto flex items-center gap-1.5 pt-1">
        {collection.typeIcons.map((iconName, i) => {
          const Icon = getIcon(iconName)
          return <Icon key={i} className="h-3.5 w-3.5 text-muted-foreground" />
        })}
      </div>
    </div>
  )
}

function ItemRow({ item }: { item: ItemWithMeta }) {
  const iconColor = item.type.color

  const date = new Date(item.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  const Icon = getIcon(item.type.icon)

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: `${iconColor}20` }}
      >
        {/* eslint-disable-next-line react-hooks/static-components */}
        <Icon className="h-4 w-4" style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-sm truncate">{item.title}</span>
          {item.isFavorite && (
            <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
          )}
          {item.isPinned && (
            <Pin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )}
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {item.description}
          </p>
        )}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <span className="shrink-0 text-xs text-muted-foreground pt-0.5">{date}</span>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  // TODO: replace with session.user.id once auth is set up
  const demoUser = await prisma.user.findUnique({
    where: { email: 'hk540539@gmail.com' },
    select: { id: true },
  })

  const [collections, pinnedItems, recentItems, stats] = await Promise.all([
    demoUser ? getCollections(demoUser.id) : [],
    demoUser ? getPinnedItems(demoUser.id) : [],
    demoUser ? getRecentItems(demoUser.id, 10) : [],
    demoUser ? getStats(demoUser.id) : { totalItems: 0, totalCollections: 0, favoriteItems: 0, favoriteCollections: 0 },
  ])

  const { totalItems, totalCollections, favoriteItems, favoriteCollections } = stats

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your developer knowledge hub
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Items" value={totalItems} icon={Layers} />
        <StatCard label="Collections" value={totalCollections} icon={FolderOpen} />
        <StatCard label="Favorite Items" value={favoriteItems} icon={Star} />
        <StatCard label="Favorite Collections" value={favoriteCollections} icon={Bookmark} />
      </div>

      {/* Collections */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Collections</h2>
          <Link
            href="/collections"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            View all
          </Link>
        </div>
        {collections.length === 0 ? (
          <p className="text-sm text-muted-foreground">No collections yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((col) => (
              <CollectionCard key={col.id} collection={col} />
            ))}
          </div>
        )}
      </section>

      {/* Pinned */}
      {pinnedItems.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Pin className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Pinned</h2>
          </div>
          <div className="space-y-2">
            {pinnedItems.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Items */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Recent Items</h2>
        {recentItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items yet.</p>
        ) : (
          <div className="space-y-2">
            {recentItems.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
