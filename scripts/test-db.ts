import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Testing database connection...\n")

  // ── Counts ────────────────────────────────────────────────────────────────
  const [userCount, itemCount, collectionCount, itemTypeCount] = await Promise.all([
    prisma.user.count(),
    prisma.item.count(),
    prisma.collection.count(),
    prisma.itemType.count(),
  ])

  console.log("── Summary ──────────────────────────────────")
  console.log(`  Users:        ${userCount}`)
  console.log(`  Item Types:   ${itemTypeCount}`)
  console.log(`  Collections:  ${collectionCount}`)
  console.log(`  Items:        ${itemCount}`)

  // ── Users ─────────────────────────────────────────────────────────────────
  const users = await prisma.user.findMany({
    select: { email: true, isPro: true, emailVerified: true },
  })
  console.log("\n── Users ─────────────────────────────────────")
  for (const u of users) {
    console.log(`  ${u.email}  isPro=${u.isPro}  verified=${u.emailVerified ? "yes" : "no"}`)
  }

  // ── System Item Types ─────────────────────────────────────────────────────
  const types = await prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
  })
  console.log("\n── System Item Types ─────────────────────────")
  for (const t of types) {
    console.log(`  ${t.name.padEnd(10)} icon=${t.icon}  color=${t.color}`)
  }

  // ── Collections with item counts ──────────────────────────────────────────
  const collections = await prisma.collection.findMany({
    include: { _count: { select: { items: true } } },
    orderBy: { name: "asc" },
  })
  console.log("\n── Collections ───────────────────────────────")
  for (const c of collections) {
    console.log(`  ${c.name.padEnd(22)} items=${c._count.items}  favorite=${c.isFavorite}`)
  }

  // ── Items by type ─────────────────────────────────────────────────────────
  const items = await prisma.item.findMany({
    include: { type: true },
    orderBy: { createdAt: "desc" },
  })
  console.log("\n── Items ─────────────────────────────────────")
  for (const i of items) {
    console.log(`  [${i.type.name.padEnd(8)}] ${i.title}`)
  }

  console.log("\n✅ All checks passed")
}

main()
  .catch((err) => {
    console.error("❌ Database test failed:", err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
