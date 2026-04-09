# Current Feature

Quick Wins from Code Audit

## Status

<!-- Not Started|In Progress|Completed -->

In Progress

## Goals

Low-risk cleanup items surfaced by the code-scanner audit. Auth is intentionally excluded — it's a larger separate feature.

- **Fix N+1 in `getSidebarItemTypes`** ([src/lib/db/items.ts:37-44](src/lib/db/items.ts#L37-L44)) — replace `include: { items: { where: { userId }, select: { id: true } } }` + `t.items.length` with Prisma `_count: { select: { items: { where: { userId } } } }` so counting happens in Postgres instead of pulling every item ID into Node.
- **Narrow `getCollections` select** ([src/lib/db/collections.ts:14-22](src/lib/db/collections.ts#L14-L22)) — only select `typeId` and `type.icon` / `type.color` on nested items instead of including full item rows. Stops shipping full snippet/prompt content over the wire on every dashboard render.
- **Extract duplicated `ICON_MAP`** — currently copy-pasted in [src/app/dashboard/page.tsx:26-42](src/app/dashboard/page.tsx#L26-L42) and [src/components/dashboard/DashboardLayout.tsx:40-56](src/components/dashboard/DashboardLayout.tsx#L40-L56). Move `ICON_MAP` and `getIcon` into `src/lib/icons.ts` and import in both places.
- **Use JSX in `TypeIcon`** ([src/app/dashboard/page.tsx:57-61](src/app/dashboard/page.tsx#L57-L61)) — replace `React.createElement(getIcon(name), …)` with `const Icon = getIcon(name); return <Icon … />` to match the pattern in `DashboardLayout.tsx`.
- **Redirect `/` to `/dashboard`** ([src/app/page.tsx](src/app/page.tsx)) — current root renders an unstyled `<h1>Devstash</h1>` stub. Replace with `redirect('/dashboard')` from `next/navigation`.

## Notes

- Use Prisma only — no raw SQL / `$queryRaw` / `$executeRaw`.
- Any index changes must go through Prisma migrations (`prisma migrate dev`), not `db push`, so dev and prod branches stay in sync.
- Skipping: auth/middleware (Critical, separate feature), duplicate `getCollections` call removal (requires layout↔page restructure), `dashboard/page.tsx` component extraction (larger refactor), `loading.tsx`/Suspense (design work), inline-style standard clarification (discussion).
- After changes: `npm run build` then `npm run lint` must pass before commit.

## History

<!-- Keep this updated. Earliest to latest -->

- Project setup and boilerplate cleanup
- Mock data added for dashboard UI (`src/lib/mock-data.ts`)
- Dashboard UI Phase 1 completed — ShadCN initialized, `/dashboard` route with topbar, sidebar and main placeholders
- Dashboard UI Phase 2 completed — collapsible sidebar with item types, favorite/all collections, user avatar, mobile drawer
- Dashboard UI Phase 3 completed — 4 stats cards, recent collections grid, pinned items section, 10 most recent items list
- Prisma + Neon PostgreSQL setup completed — Prisma 7, full schema with NextAuth models, indexes, cascade deletes, initial migration, system ItemTypes seeded
- Seed sample data completed — demo user, 7 system ItemTypes, 5 collections, 18 items seeded
- Dashboard Collections — Real Data completed — collections fetched from DB, border color from dominant type, type icons shown
- Dashboard Items — Real Data completed — pinned and recent items fetched from DB, icon/color from item type, tags displayed, mock data fully removed
- Stats & Sidebar — Real Data completed — accurate stats from DB, system item types in sidebar (ordered/renamed), colored circle for recent collections, View all collections link added
- Add Pro Badge to Sidebar completed — subtle outline PRO badge added to Files and Images item types in expanded sidebar using ShadCN Badge
