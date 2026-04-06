import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const SYSTEM_ITEM_TYPES = [
  { name: "Snippet", icon: "code-xml", color: "#7C3AED" },
  { name: "Prompt",  icon: "sparkles", color: "#2563EB" },
  { name: "Command", icon: "terminal", color: "#059669" },
  { name: "Note",    icon: "notebook", color: "#D97706" },
  { name: "File",    icon: "file",     color: "#6B7280" },
  { name: "Image",   icon: "image",    color: "#DB2777" },
  { name: "Link",    icon: "link",     color: "#0891B2" },
]

async function main() {
  console.log("Seeding system item types...")

  for (const type of SYSTEM_ITEM_TYPES) {
    await prisma.itemType.upsert({
      where: { id: type.name.toLowerCase() },
      update: {},
      create: {
        id: type.name.toLowerCase(),
        name: type.name,
        icon: type.icon,
        color: type.color,
        isSystem: true,
        userId: null,
      },
    })
    console.log(`  ✅ ${type.name}`)
  }

  console.log("Seeding complete.")
}

main()
  .catch((err) => {
    console.error("Seed failed:", err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
