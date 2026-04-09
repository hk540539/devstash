# Current Feature: Auth Setup - NextAuth + GitHub Provider

<!-- Feature name here -->

## Status

<!-- Not Started|In Progress|Completed -->

In Progress

## Goals

<!-- Goals & requirements -->

- Install NextAuth v5 (`next-auth@beta`) and `@auth/prisma-adapter`
- Set up split auth config pattern for edge compatibility (`auth.config.ts` + `auth.ts`)
- Add GitHub OAuth provider
- Protect `/dashboard/*` routes via Next.js 16 proxy (`src/proxy.ts`)
- Redirect unauthenticated users to NextAuth's default sign-in page
- Extend Session type with `user.id` via `src/types/next-auth.d.ts`

## Notes

<!-- Any extra notes -->

**Files to create:**
1. `src/auth.config.ts` — edge-compatible config (providers only, no adapter)
2. `src/auth.ts` — full config with Prisma adapter + JWT strategy
3. `src/app/api/auth/[...nextauth]/route.ts` — export handlers from auth.ts
4. `src/proxy.ts` — route protection with redirect logic (named export: `export const proxy = auth(...)`)
5. `src/types/next-auth.d.ts` — extend Session type with `user.id`

**Gotchas:**
- Use `next-auth@beta` (not `@latest` — that's v4)
- `src/proxy.ts` must sit at same level as `app/`
- Use `session: { strategy: 'jwt' }` with split config pattern
- Do NOT set custom `pages.signIn` — use NextAuth's default
- Verify latest conventions via Context7 before implementing

**Env vars:** `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`

**Testing:** `/dashboard` → redirect to sign-in → GitHub OAuth → redirect back to `/dashboard`.

**References:**
- Edge compatibility: https://authjs.dev/getting-started/installation#edge-compatibility
- Prisma adapter: https://authjs.dev/getting-started/adapters/prisma

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
- Quick Wins from Code Audit completed — fixed N+1 in getSidebarItemTypes via Prisma _count, narrowed getCollections select, extracted ICON_MAP to src/lib/icons.ts, replaced TypeIcon React.createElement with JSX pattern, redirected / to /dashboard
