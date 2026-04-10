import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"

const KEEP_EMAIL = "demo@devstash.local"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const targets = await prisma.user.findMany({
    where: { email: { not: KEEP_EMAIL } },
    select: {
      id: true,
      email: true,
      _count: { select: { items: true, collections: true } },
    },
  })

  if (targets.length === 0) {
    console.log("No users to delete.")
    return
  }

  console.log(`Deleting ${targets.length} user(s):\n`)
  for (const u of targets) {
    console.log(`  ${u.email}  (${u._count.items} items, ${u._count.collections} collections)`)
  }

  const ids = targets.map((u) => u.id)
  const emails = targets.map((u) => u.email)

  // VerificationToken is keyed by email (not userId) so cascade won't catch it
  await prisma.verificationToken.deleteMany({ where: { identifier: { in: emails } } })

  // Cascade deletes handle: items, collections, tags, accounts, sessions, itemTags
  await prisma.user.deleteMany({ where: { id: { in: ids } } })

  console.log(`\n✅ Done. Kept ${KEEP_EMAIL}.`)
}

main()
  .catch((err) => {
    console.error("❌ Failed:", err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
