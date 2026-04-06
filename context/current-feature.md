# Current Feature

Seed Sample Data

## Status

<!-- Not Started|In Progress|Completed -->

In Progress

## Goals

<!-- Goals & requirements -->

- Install bcryptjs and hash demo user password (12 rounds)
- Add `emailVerified` field to User model + migration
- Overwrite `prisma/seed.ts` with full sample data
- Seed 1 demo user (hk540539@gmail.com)
- Seed 7 system ItemTypes with updated icons/colors from spec
- Seed 5 collections with items: React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources

## Notes

<!-- Any extra notes -->

- Spec: `context/features/seed-spec.md`
- Use `upsert` so seed is idempotent (safe to re-run)
- Real URLs required for link items (DevOps and Design Resources collections)

## History

<!-- Keep this updated. Earliest to latest -->

- Project setup and boilerplate cleanup
- Mock data added for dashboard UI (`src/lib/mock-data.ts`)
- Dashboard UI Phase 1 completed — ShadCN initialized, `/dashboard` route with topbar, sidebar and main placeholders
- Dashboard UI Phase 2 completed — collapsible sidebar with item types, favorite/all collections, user avatar, mobile drawer
- Dashboard UI Phase 3 completed — 4 stats cards, recent collections grid, pinned items section, 10 most recent items list
- Prisma + Neon PostgreSQL setup completed — Prisma 7, full schema with NextAuth models, indexes, cascade deletes, initial migration, system ItemTypes seeded
