# Current Feature

## Status

Not Started

## Goals

## Notes

## History

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
- Auth Phase 3 completed — Custom /sign-in and /register pages (Server Actions, useActionState); reusable UserAvatar (image or initials); sidebar dropdown with sign out; dashboard wired to real session; GitHub OAuth iss fix in route handler; proxy.ts simplified to standard Next.js 16 pattern
- Email Verification on Register completed — Resend SDK integration; verification token generated and stored in VerificationToken table (24h expiry); email sent on register; /verify-email page validates token and marks user verified; credentials sign-in blocked until emailVerified is set; clear error message shown on sign-in for unverified accounts
