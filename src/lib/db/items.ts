import { prisma } from "@/lib/prisma";

export type SidebarItemType = {
  id: string;
  name: string; // display name e.g. "Snippets"
  slug: string; // URL segment e.g. "snippets"
  icon: string;
  color: string;
  count: number;
  isPro: boolean;
};

// Ordered display config: DB name → display label shown in sidebar
const SIDEBAR_TYPE_ORDER: Array<{ dbName: string; displayName: string; isPro?: boolean }> = [
  { dbName: "Snippet", displayName: "Snippets" },
  { dbName: "Prompt",  displayName: "Prompts"  },
  { dbName: "Command", displayName: "Commands" },
  { dbName: "Note",    displayName: "Notes"    },
  { dbName: "File",    displayName: "Files",   isPro: true },
  { dbName: "Image",   displayName: "Images",  isPro: true },
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
      _count: {
        select: { items: { where: { userId } } },
      },
    },
  });

  const typeMap = new Map(types.map((t) => [t.name, t]));

  return SIDEBAR_TYPE_ORDER.flatMap(({ dbName, displayName, isPro }) => {
    const t = typeMap.get(dbName);
    if (!t) return [];
    return [
      {
        id: t.id,
        name: displayName,
        slug: dbName.toLowerCase() + "s",
        icon: t.icon ?? "File",
        color: t.color ?? "#6B7280",
        count: t._count.items,
        isPro: isPro ?? false,
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

// Slug → typeId map derived from SIDEBAR_TYPE_ORDER
const SLUG_TO_TYPE_ID: Record<string, string> = Object.fromEntries(
  SIDEBAR_TYPE_ORDER.map(({ dbName }) => [dbName.toLowerCase() + "s", dbName.toLowerCase()]),
);

export async function getItemsByType(
  userId: string,
  slug: string,
): Promise<ItemWithMeta[]> {
  const typeId = SLUG_TO_TYPE_ID[slug];
  if (!typeId) return [];

  const items = await prisma.item.findMany({
    where: { userId, typeId },
    select: itemSelect,
    orderBy: { createdAt: "desc" },
  });
  return items.map(mapItem);
}

export function getTypeLabelFromSlug(slug: string): string | null {
  const entry = SIDEBAR_TYPE_ORDER.find(
    ({ dbName }) => dbName.toLowerCase() + "s" === slug,
  );
  return entry?.displayName ?? null;
}

export type ItemDetail = ItemWithMeta & {
  content: string | null;
  url: string | null;
  language: string | null;
  fileName: string | null;
  fileUrl: string | null;
  fileSize: number | null;
  updatedAt: Date;
  collection: { id: string; name: string } | null;
};

export type UpdateItemData = {
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  tags: string[];
};

export async function updateItemById(
  id: string,
  userId: string,
  data: UpdateItemData,
): Promise<ItemDetail> {
  const item = await prisma.$transaction(async (tx) => {
    // Disconnect all existing tags
    await tx.itemTag.deleteMany({ where: { itemId: id } });

    // Upsert each tag and collect IDs
    const tagIds = await Promise.all(
      data.tags.map(async (name) => {
        const tag = await tx.tag.upsert({
          where: { userId_name: { userId, name } },
          create: { name, userId },
          update: {},
        });
        return tag.id;
      }),
    );

    // Reconnect new tags
    if (tagIds.length > 0) {
      await tx.itemTag.createMany({
        data: tagIds.map((tagId) => ({ itemId: id, tagId })),
      });
    }

    return tx.item.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        url: data.url,
        language: data.language,
      },
      select: {
        ...itemSelect,
        content: true,
        url: true,
        language: true,
        fileName: true,
        fileUrl: true,
        fileSize: true,
        updatedAt: true,
        collection: { select: { id: true, name: true } },
      },
    });
  });

  return {
    ...mapItem(item),
    content: item.content,
    url: item.url,
    language: item.language,
    fileName: item.fileName,
    fileUrl: item.fileUrl,
    fileSize: item.fileSize,
    updatedAt: item.updatedAt,
    collection: item.collection ?? null,
  };
}

export async function deleteItemById(
  id: string,
  userId: string,
): Promise<void> {
  await prisma.item.delete({ where: { id, userId } });
}

export async function getItemById(
  id: string,
  userId: string,
): Promise<ItemDetail | null> {
  const item = await prisma.item.findFirst({
    where: { id, userId },
    select: {
      ...itemSelect,
      content: true,
      url: true,
      language: true,
      fileName: true,
      fileUrl: true,
      fileSize: true,
      updatedAt: true,
      collection: { select: { id: true, name: true } },
    },
  });

  if (!item) return null;

  return {
    ...mapItem(item),
    content: item.content,
    url: item.url,
    language: item.language,
    fileName: item.fileName,
    fileUrl: item.fileUrl,
    fileSize: item.fileSize,
    updatedAt: item.updatedAt,
    collection: item.collection ?? null,
  };
}
