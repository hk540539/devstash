import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Testing database connection...")

  const userCount = await prisma.user.count()
  const itemCount = await prisma.item.count()
  const collectionCount = await prisma.collection.count()
  const itemTypes = await prisma.itemType.findMany({ where: { isSystem: true } })

  console.log("✅ Connected to database successfully")
  console.log(`   Users:            ${userCount}`)
  console.log(`   Items:            ${itemCount}`)
  console.log(`   Collections:      ${collectionCount}`)
  console.log(`   System ItemTypes: ${itemTypes.map((t) => t.name).join(", ")}`)
}

main()
  .catch((err) => {
    console.error("❌ Database connection failed:", err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
