import { prisma } from "@/lib/prisma";

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
