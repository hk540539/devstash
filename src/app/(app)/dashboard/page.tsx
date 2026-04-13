import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Layers,
  FolderOpen,
  Star,
  Bookmark,
  type LucideIcon,
} from "lucide-react";
import { auth } from "@/auth";
import { getCollections } from "@/lib/db/collections";
import { getStats, getPinnedItems, getRecentItems } from "@/lib/db/items";
import { getIcon } from "@/lib/icons";
import { DashboardItemsWithDrawer } from "@/components/items/DashboardItemsWithDrawer";

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
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
  );
}

function CollectionCard({
  collection,
}: {
  collection: Awaited<ReturnType<typeof getCollections>>[number];
}) {
  return (
    <div
      className="rounded-lg border border-border bg-card p-4 flex flex-col gap-2 border-l-[3px]"
      style={{ borderLeftColor: collection.dominantColor }}
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
        {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
      </p>
      {collection.description && (
        <p className="text-sm text-muted-foreground line-clamp-1">
          {collection.description}
        </p>
      )}
      <div className="mt-auto flex items-center gap-1.5 pt-1">
        {collection.typeIcons.map((iconName, i) => {
          const Icon = getIcon(iconName);
          return <Icon key={i} className="h-3.5 w-3.5 text-muted-foreground" />;
        })}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  const userId = session.user.id;

  const [collections, pinnedItems, recentItems, stats] = await Promise.all([
    getCollections(userId),
    getPinnedItems(userId),
    getRecentItems(userId, 10),
    getStats(userId),
  ]);

  const { totalItems, totalCollections, favoriteItems, favoriteCollections } =
    stats;

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
        <StatCard
          label="Favorite Collections"
          value={favoriteCollections}
          icon={Bookmark}
        />
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

      {/* Pinned + Recent Items (client wrapper for drawer) */}
      <DashboardItemsWithDrawer
        pinnedItems={pinnedItems}
        recentItems={recentItems}
      />
    </div>
  );
}