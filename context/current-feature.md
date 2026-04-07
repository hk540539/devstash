# Current Feature

<!-- Feature name here -->

## Status

<!-- Not Started|In Progress|Completed -->

Not Started

## Goals

<!-- Goals & requirements -->

## Notes

<!-- Any extra notes -->

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
