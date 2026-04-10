# Current Feature: Auth Phase 3 — Sign In, Register & Sign Out UI

<!-- Feature name here -->

## Status

<!-- Not Started|In Progress|Completed -->

In Progress

## Goals

<!-- Goals & requirements -->

- Custom `/sign-in` page — email/password fields, "Sign in with GitHub" button, link to register, form validation + error display
- Custom `/register` page — name, email, password, confirm password fields; client-side validation (passwords match, email format); submit to `/api/auth/register`; redirect to `/sign-in` on success
- Update NextAuth to use custom pages (point `pages.signIn` to `/sign-in`)
- Sidebar bottom — display user avatar (GitHub image or initials fallback), user name, dropdown on click with "Sign out" option, avatar click goes to `/profile`
- Reusable avatar component: shows `image` if available, otherwise generates initials from name (e.g. "Brad Traversy" → "BT")

## Notes

<!-- Any extra notes -->

- Avatar initials logic: take first letter of each word in name, e.g. "Brad Traversy" → "BT"
- Keep existing sidebar structure; update the bottom user section only
- Use ShadCN components where applicable (DropdownMenu, Avatar, etc.)
- Form state/validation should be client-side (`'use client'`)
- Register page submits to existing `POST /api/auth/register` route

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
- Auth Phase 1 completed — NextAuth v5 (beta) + Prisma adapter + GitHub OAuth; split edge config (auth.config.ts + auth.ts) with JWT strategy; proxy.ts protects /dashboard/* and redirects unauth users to sign-in; Session extended with user.id; added name/image fields to User model (+ migration) required by the Prisma adapter
- Auth Phase 2 completed — Credentials provider added (placeholder in auth.config.ts, bcrypt validation in auth.ts); POST /api/auth/register route for user registration; email/password sign-in working alongside GitHub OAuth
