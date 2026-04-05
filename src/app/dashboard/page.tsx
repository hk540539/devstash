import Link from 'next/link'
import {
  Layers,
  FolderOpen,
  Star,
  Bookmark,
  Pin,
  CodeXml,
  Sparkles,
  Terminal,
  Notebook,
  File,
  Image as ImageIcon,
  Link2,
  type LucideIcon,
} from 'lucide-react'
import { mockCollections, mockItems, mockItemTypes } from '@/lib/mock-data'

// ── Icon helpers ──────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  'code-xml': CodeXml,
  sparkles: Sparkles,
  terminal: Terminal,
  notebook: Notebook,
  file: File,
  image: ImageIcon,
  link: Link2,
}

function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? File
}

// ── Derived data ──────────────────────────────────────────────────────────────

const totalItems = mockItemTypes.reduce((sum, t) => sum + t.count, 0)
const totalCollections = mockCollections.length
const favoriteItems = mockItems.filter((i) => i.isFavorite).length
const favoriteCollections = mockCollections.filter((c) => c.isFavorite).length

const pinnedItems = mockItems.filter((i) => i.isPinned)
const recentItems = [...mockItems]
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 10)

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
  collection: (typeof mockCollections)[number]
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-medium truncate">{collection.name}</span>
          {collection.isFavorite && (
            <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {collection.itemCount} items
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

function ItemRow({ item }: { item: (typeof mockItems)[number] }) {
  const type = mockItemTypes.find((t) => t.id === item.typeId)
  const Icon = type ? getIcon(type.icon) : File
  const iconColor = type?.color ?? '#6B7280'

  const date = new Date(item.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: `${iconColor}20` }}
      >
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
        {item.tags && item.tags.length > 0 && (
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

export default function DashboardPage() {
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockCollections.map((col) => (
            <CollectionCard key={col.id} collection={col} />
          ))}
        </div>
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
        <div className="space-y-2">
          {recentItems.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  )
}
