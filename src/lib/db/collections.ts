import { prisma } from "@/lib/prisma"

export type CollectionWithMeta = {
  id: string
  name: string
  description: string | null
  isFavorite: boolean
  itemCount: number
  typeIcons: string[]
  dominantColor: string
}

export async function getCollections(userId: string): Promise<CollectionWithMeta[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    include: {
      items: {
        include: { type: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return collections.map((col) => {
    // Count items per type to find dominant color
    const typeCounts = new Map<string, { count: number; icon: string; color: string }>()
    for (const item of col.items) {
      const existing = typeCounts.get(item.typeId)
      if (existing) {
        existing.count++
      } else {
        typeCounts.set(item.typeId, {
          count: 1,
          icon: item.type.icon ?? "File",
          color: item.type.color ?? "#6B7280",
        })
      }
    }

    // Most-used type drives the border color
    let dominantColor = "#6B7280"
    let maxCount = 0
    for (const [, meta] of typeCounts) {
      if (meta.count > maxCount) {
        maxCount = meta.count
        dominantColor = meta.color
      }
    }

    // Unique type icons (preserving insertion order = most-used first)
    const typeIcons = [...typeCounts.values()].map((m) => m.icon)

    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      itemCount: col.items.length,
      typeIcons,
      dominantColor,
    }
  })
}
