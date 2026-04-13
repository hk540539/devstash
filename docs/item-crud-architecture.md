# Item CRUD Architecture

Design document for the unified CRUD system covering all 7 item types (Snippet, Prompt, Command, Note, File, Image, Link).

---

## Guiding Principles

- **Mutations in one action file** — `src/actions/items.ts` handles create, update, delete for every type.
- **Queries in lib/db** — `src/lib/db/items.ts` (already exists) is extended; called directly from server components.
- **One dynamic route** — `/items/[type]` renders the filtered item list per type.
- **Type-specific logic lives in components, not actions** — actions operate on the generic `Item` model; components decide how to render/present based on type.

---

## File Structure

```
src/
├── actions/
│   └── items.ts                  # create, update, delete, toggleFavorite, togglePinned
│
├── lib/
│   └── db/
│       └── items.ts              # getItemsByType, getItemById, getPinnedItems, getRecentItems, getSidebarItemTypes, getStats
│
├── app/
│   └── (app)/
│       └── items/
│           └── [type]/
│               └── page.tsx      # server component — fetches items for the given type slug
│
└── components/
    └── items/
        ├── ItemList.tsx          # renders the grid/list of ItemCard components
        ├── ItemCard.tsx          # single item card — adapts display by type
        ├── ItemForm.tsx          # create/edit modal or drawer — adapts fields by type
        └── ItemDetail.tsx        # full-screen view of one item
```

---

## `/items/[type]` Routing

### Route: `src/app/(app)/items/[type]/page.tsx`

The `[type]` segment is the **slug** generated from the type name: `snippet → snippets`, `prompt → prompts`, etc.

| URL               | Type ID   |
|-------------------|-----------|
| `/items/snippets` | `snippet` |
| `/items/prompts`  | `prompt`  |
| `/items/commands` | `command` |
| `/items/notes`    | `note`    |
| `/items/files`    | `file`    |
| `/items/images`   | `image`   |
| `/items/links`    | `link`    |

The slug-to-typeId mapping is derived from `SIDEBAR_TYPE_ORDER` in `src/lib/db/items.ts` (already defines `slug` per type as `dbName.toLowerCase() + "s"`).

```ts
// page.tsx (server component)
export default async function ItemsByTypePage({ params }: { params: { type: string } }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const items = await getItemsByType(session.user.id, params.type)
  // params.type is the slug, e.g. "snippets"
  // getItemsByType resolves slug → typeId internally

  return <ItemList items={items} typeSlug={params.type} />
}

// Optional: generateStaticParams for the 7 known slugs
export function generateStaticParams() {
  return ['snippets','prompts','commands','notes','files','images','links'].map(t => ({ type: t }))
}
```

---

## Mutations — `src/actions/items.ts`

One file, all 7 types. Actions receive a discriminated input shape validated with Zod. Type-specific fields are included but optional; validation selects the relevant fields based on the type.

```ts
'use server'

// Return shape consistent with the existing codebase pattern
type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string }

export async function createItem(formData: FormData): Promise<ActionResult<{ id: string }>>
export async function updateItem(id: string, formData: FormData): Promise<ActionResult>
export async function deleteItem(id: string): Promise<ActionResult>
export async function toggleFavorite(id: string, value: boolean): Promise<ActionResult>
export async function togglePinned(id: string, value: boolean): Promise<ActionResult>
```

### Input shape (Zod)

```ts
const baseSchema = z.object({
  typeId:      z.string(),
  title:       z.string().min(1).max(255),
  description: z.string().optional(),
  collectionId:z.string().optional(),
  tags:        z.array(z.string()).optional(),
})

// text-based types
const textItemSchema = baseSchema.extend({
  contentType: z.literal('text'),
  content:     z.string().optional(),
  language:    z.string().optional(),  // snippet/command only
  url:         z.string().url().optional(),  // link only
})

// file-based types
const fileItemSchema = baseSchema.extend({
  contentType: z.literal('file'),
  fileUrl:     z.string().url(),
  fileName:    z.string(),
  fileSize:    z.number().int().positive(),
})

const itemSchema = z.discriminatedUnion('contentType', [textItemSchema, fileItemSchema])
```

### Auth guard pattern

```ts
export async function createItem(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Not authenticated.' }

  const parsed = itemSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: 'Invalid input.' }

  const item = await prisma.item.create({ data: { ...parsed.data, userId: session.user.id } })
  revalidatePath('/items')
  return { success: true, data: { id: item.id } }
}
```

### Ownership check for update/delete

```ts
export async function deleteItem(id: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Not authenticated.' }

  const item = await prisma.item.findUnique({ where: { id }, select: { userId: true } })
  if (!item || item.userId !== session.user.id) return { success: false, error: 'Not found.' }

  await prisma.item.delete({ where: { id } })
  revalidatePath('/items')
  return { success: true }
}
```

---

## Queries — `src/lib/db/items.ts` (extensions)

Add these to the existing file alongside `getPinnedItems`, `getRecentItems`, etc.

```ts
// Resolve slug → typeId, then fetch
export async function getItemsByType(userId: string, slug: string): Promise<ItemWithMeta[]>

// Full item detail including content, url, fileUrl, fileName, fileSize, language
export async function getItemById(userId: string, id: string): Promise<ItemDetail | null>
```

`ItemDetail` extends `ItemWithMeta` with the type-specific fields:
```ts
export type ItemDetail = ItemWithMeta & {
  content:   string | null
  url:       string | null
  fileUrl:   string | null
  fileName:  string | null
  fileSize:  number | null
  language:  string | null
}
```

---

## Component Responsibilities

### `ItemList`

- Server or client component (can be server — receives pre-fetched items as props).
- Renders the page header (type name, count, "+ New" button).
- Maps items to `<ItemCard>` components.
- Handles empty state.

### `ItemCard`

- Client component (interactive: favorite, pin, delete, open detail).
- Receives a single `ItemWithMeta` item.
- Adapts the **preview** region by `item.type.name`:

| Type    | Preview shown in card                        |
|---------|----------------------------------------------|
| Snippet | First ~3 lines of `content` in a code block  |
| Prompt  | Truncated plain text of `content`            |
| Command | Monospace one-liner from `content`           |
| Note    | Truncated markdown plain text of `content`   |
| Link    | `url` as a styled anchor                     |
| File    | `fileName` + formatted `fileSize`            |
| Image   | Thumbnail `<img>` from `fileUrl`             |

- Type icon + color dot sourced from `item.type.icon` / `item.type.color` via `getIcon()`.
- Action buttons: favorite (star), pin, open, delete.
- Calls server actions via `useTransition` for optimistic UI.

### `ItemForm`

- Client component (modal or sheet).
- Receives `typeId` and optional existing `item` (edit mode).
- Renders **shared fields** for all types: title, description, collection, tags.
- Renders **type-specific fields** conditionally:

| Type    | Extra fields shown                                |
|---------|---------------------------------------------------|
| Snippet | `content` (code editor), `language` (select)     |
| Prompt  | `content` (textarea/markdown editor)             |
| Command | `content` (monospace input)                      |
| Note    | `content` (markdown editor)                      |
| Link    | `url` (text input with URL validation)           |
| File    | File upload input → sets `fileUrl/fileName/fileSize` |
| Image   | Image upload input → sets `fileUrl/fileName/fileSize` |

- Submits via `createItem` or `updateItem` server action.
- Shows toast on success/error using the existing `{ success, error }` pattern.

### `ItemDetail`

- Client component (full-screen modal, drawer, or dedicated route).
- Receives `ItemDetail` (fetched via `getItemById`).
- Renders the full content by type:

| Type    | Full render                                        |
|---------|----------------------------------------------------|
| Snippet | Syntax-highlighted code block (full content)       |
| Prompt  | Markdown rendered body                             |
| Command | Copyable monospace block                           |
| Note    | Full markdown rendered document                    |
| Link    | Metadata card + clickable URL                      |
| File    | Download button + file info                        |
| Image   | Full-resolution image preview                      |

- Edit button opens `ItemForm` in edit mode.
- Delete button calls `deleteItem` action with confirmation dialog.

---

## Where Type-Specific Logic Lives

| Concern                     | Location                            |
|-----------------------------|-------------------------------------|
| Which DB fields to write    | `src/actions/items.ts` (Zod schema) |
| Which DB fields to read     | `src/lib/db/items.ts`               |
| URL routing by type         | `src/app/(app)/items/[type]/page.tsx` |
| Card preview per type       | `src/components/items/ItemCard.tsx` |
| Form fields per type        | `src/components/items/ItemForm.tsx` |
| Full content render per type| `src/components/items/ItemDetail.tsx` |

Actions know nothing about rendering. Components know nothing about how to construct queries. The `typeId` field is the single discriminator passed through the whole chain.

---

## Tags

Tags are managed in the same action file. On create/update:

1. Upsert each tag by `{ userId, name }`.
2. Delete existing `ItemTag` rows for the item.
3. Create new `ItemTag` rows linking item → tags.

This is done in a Prisma transaction inside `createItem` / `updateItem`.

---

## Free Tier Enforcement

Free users are limited to **50 items** and **3 collections** (per spec). Check is done in `createItem` before writing:

```ts
const count = await prisma.item.count({ where: { userId: session.user.id } })
if (!user.isPro && count >= 50) {
  return { success: false, error: 'Free tier limit reached. Upgrade to Pro for unlimited items.' }
}
```

File and Image types additionally require `isPro` (per spec):

```ts
if (['file', 'image'].includes(parsed.data.typeId) && !user.isPro && parsed.data.typeId === 'file') {
  return { success: false, error: 'File uploads require a Pro plan.' }
}
```

---

## Summary

```
User action
    │
    ▼
ItemForm (client)        ← type-specific fields rendered here
    │ calls
    ▼
src/actions/items.ts     ← auth + Zod validation + DB write (type-agnostic)
    │ revalidates
    ▼
/items/[type]/page.tsx   ← server component re-fetches
    │ passes items to
    ▼
ItemList → ItemCard      ← type-specific preview rendered here
    │ opens
    ▼
ItemDetail               ← type-specific full render here
```
