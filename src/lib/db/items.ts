import { prisma } from "@/lib/prisma";

export type SidebarItemType = {
  id: string;
  name: string; // display name e.g. "Snippets"
  slug: string; // URL segment e.g. "snippets"
  icon: string;
  color: string;
  count: number;
};

// Ordered display config: DB name → display label shown in sidebar
const SIDEBAR_TYPE_ORDER: Array<{ dbName: string; displayName: string }> = [
  { dbName: "Snippet", displayName: "Snippets" },
  { dbName: "Prompt",  displayName: "Prompts"  },
  { dbName: "Note",    displayName: "Notes"    },
  { dbName: "File",    displayName: "Files"    },
  { dbName: "Image",   displayName: "Images"   },
  { dbName: "Link",    displayName: "Links"    },
];

export async function getStats(userId: string) {
  const [totalItems, totalCollections, favoriteItems, favoriteCollections] =
    await Promise.all([
      prisma.item.count({ where: { userId } }),
      prisma.collection.count({ where: { userId } }),
      prisma.item.count({ where: { userId, isFavorite: true } }),
      prisma.collection.count({ where: { userId, isFavorite: true } }),
    ]);
  return { totalItems, totalCollections, favoriteItems, favoriteCollections };
}

export async function getSidebarItemTypes(
  userId: string,
): Promise<SidebarItemType[]> {
  const types = await prisma.itemType.findMany({
    where: { isSystem: true },
    include: {
      items: {
        where: { userId },
        select: { id: true },
      },
    },
  });

  const typeMap = new Map(types.map((t) => [t.name, t]));

  return SIDEBAR_TYPE_ORDER.flatMap(({ dbName, displayName }) => {
    const t = typeMap.get(dbName);
    if (!t) return [];
    return [
      {
        id: t.id,
        name: displayName,
        slug: dbName.toLowerCase() + "s",
        icon: t.icon ?? "File",
        color: t.color ?? "#6B7280",
        count: t.items.length,
      },
    ];
  });
}

export type ItemWithMeta = {
  id: string;
  title: string;
  description: string | null;
  contentType: string;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  type: {
    name: string;
    icon: string;
    color: string;
  };
  tags: string[];
};

const itemSelect = {
  id: true,
  title: true,
  description: true,
  contentType: true,
  isFavorite: true,
  isPinned: true,
  createdAt: true,
  type: {
    select: { name: true, icon: true, color: true },
  },
  tags: {
    select: { tag: { select: { name: true } } },
  },
} as const;

function mapItem(item: {
  id: string;
  title: string;
  description: string | null;
  contentType: string;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  type: { name: string; icon: string | null; color: string | null };
  tags: { tag: { name: string } }[];
}): ItemWithMeta {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    contentType: item.contentType,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    type: {
      name: item.type.name,
      icon: item.type.icon ?? "File",
      color: item.type.color ?? "#6B7280",
    },
    tags: item.tags.map((t) => t.tag.name),
  };
}

export async function getPinnedItems(userId: string): Promise<ItemWithMeta[]> {
  const items = await prisma.item.findMany({
    where: { userId, isPinned: true },
    select: itemSelect,
    orderBy: { updatedAt: "desc" },
  });
  return items.map(mapItem);
}

export async function getRecentItems(
  userId: string,
  limit = 10,
): Promise<ItemWithMeta[]> {
  const items = await prisma.item.findMany({
    where: { userId },
    select: itemSelect,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return items.map(mapItem);
}
