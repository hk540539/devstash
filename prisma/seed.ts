import "dotenv/config"
import bcrypt from "bcryptjs"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ── System Item Types ─────────────────────────────────────────────────────────

const SYSTEM_TYPES = [
  { id: "snippet", name: "Snippet", icon: "Code",       color: "#3b82f6" },
  { id: "prompt",  name: "Prompt",  icon: "Sparkles",   color: "#8b5cf6" },
  { id: "command", name: "Command", icon: "Terminal",   color: "#f97316" },
  { id: "note",    name: "Note",    icon: "StickyNote", color: "#fde047" },
  { id: "file",    name: "File",    icon: "File",       color: "#6b7280" },
  { id: "image",   name: "Image",   icon: "Image",      color: "#ec4899" },
  { id: "link",    name: "Link",    icon: "Link",       color: "#10b981" },
]

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding database...\n")

  // System item types
  console.log("Seeding system item types...")
  for (const type of SYSTEM_TYPES) {
    await prisma.itemType.upsert({
      where: { id: type.id },
      update: { name: type.name, icon: type.icon, color: type.color },
      create: { id: type.id, name: type.name, icon: type.icon, color: type.color, isSystem: true, userId: null },
    })
    console.log(`  ✅ ${type.name}`)
  }

  // Demo user
  console.log("\nSeeding demo user...")
  const passwordHash = await bcrypt.hash("12345678", 12)
  const user = await prisma.user.upsert({
    where: { email: "hk540539@gmail.com" },
    update: {},
    create: {
      email: "hk540539@gmail.com",
      password: passwordHash,
      emailVerified: new Date(),
      isPro: false,
    },
  })
  console.log(`  ✅ ${user.email}`)

  // Collections
  console.log("\nSeeding collections and items...")

  // ── React Patterns ──────────────────────────────────────────────────────────
  const reactPatterns = await prisma.collection.upsert({
    where: { id: "col_react_patterns" },
    update: {},
    create: {
      id: "col_react_patterns",
      name: "React Patterns",
      description: "Reusable React patterns and hooks",
      userId: user.id,
      isFavorite: true,
    },
  })

  await prisma.item.upsert({
    where: { id: "item_use_debounce" },
    update: {},
    create: {
      id: "item_use_debounce",
      title: "useDebounce Hook",
      description: "Delays updating a value until after a specified delay",
      contentType: "text",
      language: "typescript",
      content: `import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}`,
      typeId: "snippet",
      collectionId: reactPatterns.id,
      userId: user.id,
      isFavorite: true,
      isPinned: true,
    },
  })

  await prisma.item.upsert({
    where: { id: "item_use_local_storage" },
    update: {},
    create: {
      id: "item_use_local_storage",
      title: "useLocalStorage Hook",
      description: "Sync state with localStorage, with SSR safety",
      contentType: "text",
      language: "typescript",
      content: `import { useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value: T) => {
    setStoredValue(value)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(value))
    }
  }

  return [storedValue, setValue] as const
}`,
      typeId: "snippet",
      collectionId: reactPatterns.id,
      userId: user.id,
    },
  })

  await prisma.item.upsert({
    where: { id: "item_compound_component" },
    update: {},
    create: {
      id: "item_compound_component",
      title: "Compound Component Pattern",
      description: "Context-based compound component for flexible composition",
      contentType: "text",
      language: "typescript",
      content: `import { createContext, useContext, useState, ReactNode } from 'react'

interface TabsContextValue {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabs() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Must be used within <Tabs>')
  return ctx
}

function Tabs({ defaultTab, children }: { defaultTab: string; children: ReactNode }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  return <TabsContext.Provider value={{ activeTab, setActiveTab }}>{children}</TabsContext.Provider>
}

function Tab({ id, children }: { id: string; children: ReactNode }) {
  const { activeTab, setActiveTab } = useTabs()
  return (
    <button onClick={() => setActiveTab(id)} aria-selected={activeTab === id}>
      {children}
    </button>
  )
}

function TabPanel({ id, children }: { id: string; children: ReactNode }) {
  const { activeTab } = useTabs()
  return activeTab === id ? <div>{children}</div> : null
}

Tabs.Tab = Tab
Tabs.Panel = TabPanel
export { Tabs }`,
      typeId: "snippet",
      collectionId: reactPatterns.id,
      userId: user.id,
    },
  })
  console.log("  ✅ React Patterns (3 snippets)")

  // ── AI Workflows ────────────────────────────────────────────────────────────
  const aiWorkflows = await prisma.collection.upsert({
    where: { id: "col_ai_workflows" },
    update: {},
    create: {
      id: "col_ai_workflows",
      name: "AI Workflows",
      description: "AI prompts and workflow automations",
      userId: user.id,
      isFavorite: true,
    },
  })

  await prisma.item.upsert({
    where: { id: "item_code_review_prompt" },
    update: {},
    create: {
      id: "item_code_review_prompt",
      title: "Code Review Prompt",
      description: "Thorough code review covering security, performance and readability",
      contentType: "text",
      content: `Review the following code and provide feedback on:

1. **Security** — any vulnerabilities, injection risks, or unsafe patterns
2. **Performance** — unnecessary re-renders, N+1 queries, expensive operations
3. **Readability** — naming, structure, and clarity
4. **Edge cases** — inputs or states that could cause unexpected behavior
5. **Improvements** — specific, actionable suggestions with code examples

Be concise. Lead with the most critical issues first.

\`\`\`
[PASTE CODE HERE]
\`\`\``,
      typeId: "prompt",
      collectionId: aiWorkflows.id,
      userId: user.id,
      isFavorite: true,
    },
  })

  await prisma.item.upsert({
    where: { id: "item_doc_gen_prompt" },
    update: {},
    create: {
      id: "item_doc_gen_prompt",
      title: "Documentation Generation Prompt",
      description: "Generate clear JSDoc or markdown docs for any function or module",
      contentType: "text",
      content: `Generate documentation for the following code. Include:

- A one-line summary
- Parameters with types and descriptions
- Return value
- Usage example
- Any important notes or caveats

Output as JSDoc comments directly above the function, and a short markdown section below.

\`\`\`
[PASTE CODE HERE]
\`\`\``,
      typeId: "prompt",
      collectionId: aiWorkflows.id,
      userId: user.id,
    },
  })

  await prisma.item.upsert({
    where: { id: "item_refactor_prompt" },
    update: {},
    create: {
      id: "item_refactor_prompt",
      title: "Refactoring Assistant Prompt",
      description: "Refactor code for clarity and maintainability without changing behavior",
      contentType: "text",
      content: `Refactor the following code with these goals:

- Improve readability and naming
- Reduce complexity and nesting
- Extract reusable logic where appropriate
- Keep the same external behavior (no feature changes)
- Add a brief comment only where logic is non-obvious

Show the refactored version and a short explanation of the key changes made.

\`\`\`
[PASTE CODE HERE]
\`\`\``,
      typeId: "prompt",
      collectionId: aiWorkflows.id,
      userId: user.id,
    },
  })
  console.log("  ✅ AI Workflows (3 prompts)")

  // ── DevOps ──────────────────────────────────────────────────────────────────
  const devops = await prisma.collection.upsert({
    where: { id: "col_devops" },
    update: {},
    create: {
      id: "col_devops",
      name: "DevOps",
      description: "Infrastructure and deployment resources",
      userId: user.id,
    },
  })

  await prisma.item.upsert({
    where: { id: "item_dockerfile_nextjs" },
    update: {},
    create: {
      id: "item_dockerfile_nextjs",
      title: "Next.js Dockerfile",
      description: "Production-ready multi-stage Dockerfile for Next.js apps",
      contentType: "text",
      language: "dockerfile",
      content: `FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]`,
      typeId: "snippet",
      collectionId: devops.id,
      userId: user.id,
    },
  })

  await prisma.item.upsert({
    where: { id: "item_deploy_script" },
    update: {},
    create: {
      id: "item_deploy_script",
      title: "Deploy to Production",
      description: "Run migrations and restart the app in production",
      contentType: "text",
      content: `npx prisma migrate deploy && npm run start`,
      typeId: "command",
      collectionId: devops.id,
      userId: user.id,
    },
  })

  await prisma.item.upsert({
    where: { id: "item_link_github_actions" },
    update: {},
    create: {
      id: "item_link_github_actions",
      title: "GitHub Actions Docs",
      description: "Official GitHub Actions documentation",
      contentType: "text",
      url: "https://docs.github.com/en/actions",
      typeId: "link",
      collectionId: devops.id,
      userId: user.id,
    },
  })

  await prisma.item.upsert({
    where: { id: "item_link_docker_docs" },
    update: {},
    create: {
      id: "item_link_docker_docs",
      title: "Docker Documentation",
      description: "Official Docker docs — references, guides, and CLI",
      contentType: "text",
      url: "https://docs.docker.com",
      typeId: "link",
      collectionId: devops.id,
      userId: user.id,
    },
  })
  console.log("  ✅ DevOps (1 snippet, 1 command, 2 links)")

  // ── Terminal Commands ───────────────────────────────────────────────────────
  const terminal = await prisma.collection.upsert({
    where: { id: "col_terminal" },
    update: {},
    create: {
      id: "col_terminal",
      name: "Terminal Commands",
      description: "Useful shell commands for everyday development",
      userId: user.id,
      isFavorite: true,
    },
  })

  const commands = [
    {
      id: "item_cmd_git_undo",
      title: "Git — Undo Last Commit",
      description: "Undo the last commit but keep changes staged",
      content: "git reset --soft HEAD~1",
    },
    {
      id: "item_cmd_docker_clean",
      title: "Docker — Clean Everything",
      description: "Remove all stopped containers, unused images, volumes and networks",
      content: "docker system prune -af --volumes",
    },
    {
      id: "item_cmd_kill_port",
      title: "Kill Process on Port",
      description: "Find and kill whatever is running on a given port (macOS/Linux)",
      content: "lsof -ti:<PORT> | xargs kill -9",
    },
    {
      id: "item_cmd_npm_outdated",
      title: "Check Outdated Packages",
      description: "List all outdated npm packages in the current project",
      content: "npm outdated",
    },
  ]

  for (const cmd of commands) {
    await prisma.item.upsert({
      where: { id: cmd.id },
      update: {},
      create: {
        id: cmd.id,
        title: cmd.title,
        description: cmd.description,
        contentType: "text",
        content: cmd.content,
        typeId: "command",
        collectionId: terminal.id,
        userId: user.id,
      },
    })
  }
  console.log("  ✅ Terminal Commands (4 commands)")

  // ── Design Resources ────────────────────────────────────────────────────────
  const design = await prisma.collection.upsert({
    where: { id: "col_design" },
    update: {},
    create: {
      id: "col_design",
      name: "Design Resources",
      description: "UI/UX resources and references",
      userId: user.id,
    },
  })

  const links = [
    {
      id: "item_link_tailwind",
      title: "Tailwind CSS Docs",
      description: "Official Tailwind CSS documentation and utility reference",
      url: "https://tailwindcss.com/docs",
    },
    {
      id: "item_link_shadcn",
      title: "shadcn/ui",
      description: "Beautifully designed components built with Radix and Tailwind",
      url: "https://ui.shadcn.com",
    },
    {
      id: "item_link_radix",
      title: "Radix UI Primitives",
      description: "Unstyled, accessible component primitives for React",
      url: "https://www.radix-ui.com",
    },
    {
      id: "item_link_lucide",
      title: "Lucide Icons",
      description: "Beautiful and consistent open-source icon library",
      url: "https://lucide.dev/icons",
    },
  ]

  for (const link of links) {
    await prisma.item.upsert({
      where: { id: link.id },
      update: {},
      create: {
        id: link.id,
        title: link.title,
        description: link.description,
        contentType: "text",
        url: link.url,
        typeId: "link",
        collectionId: design.id,
        userId: user.id,
      },
    })
  }
  console.log("  ✅ Design Resources (4 links)")

  console.log("\nSeeding complete ✅")
}

main()
  .catch((err) => {
    console.error("Seed failed:", err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
