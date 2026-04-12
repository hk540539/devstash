import { prisma } from "@/lib/prisma"

export type ProfileUser = {
  id: string
  name: string | null
  email: string
  image: string | null
  createdAt: Date
  hasPassword: boolean
}

export type ItemTypeCount = {
  id: string
  name: string
  icon: string
  color: string
  count: number
}

export type ProfileStats = {
  totalItems: number
  totalCollections: number
  itemTypeCounts: ItemTypeCount[]
}

export async function getProfileUser(userId: string): Promise<ProfileUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      password: true,
    },
  })

  if (!user) return null

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    createdAt: user.createdAt,
    hasPassword: user.password !== null,
  }
}

export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const [totalItems, totalCollections, itemTypes] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.itemType.findMany({
      where: { isSystem: true },
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
        _count: { select: { items: { where: { userId } } } },
      },
      orderBy: { name: "asc" },
    }),
  ])

  const itemTypeCounts: ItemTypeCount[] = itemTypes.map((t) => ({
    id: t.id,
    name: t.name,
    icon: t.icon ?? "File",
    color: t.color ?? "#6B7280",
    count: t._count.items,
  }))

  return { totalItems, totalCollections, itemTypeCounts }
}
