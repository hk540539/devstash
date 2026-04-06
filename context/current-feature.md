# Current Feature

Prisma + Neon PostgreSQL Setup

## Status

<!-- Not Started|In Progress|Completed -->

In Progress

## Goals

<!-- Goals & requirements -->

- Install and configure Prisma 7 (note: has breaking changes vs v6)
- Set up Neon PostgreSQL (serverless) as the database provider
- Create initial schema based on data models in `context/project-overview.md`
- Include NextAuth models (Account, Session, VerificationToken)
- Add appropriate indexes and cascade deletes
- Always use `prisma migrate dev` — never `db push`
- Dev branch maps to `DATABASE_URL`, production branch separate

## Notes

<!-- Any extra notes -->

- Use Prisma 7 — review upgrade guide for breaking changes before implementing
- Development and production use separate Neon branches
- Schema will evolve — keep migrations in sync

## History

<!-- Keep this updated. Earliest to latest -->

- Project setup and boilerplate cleanup
- Mock data added for dashboard UI (`src/lib/mock-data.ts`)
- Dashboard UI Phase 1 completed — ShadCN initialized, `/dashboard` route with topbar, sidebar and main placeholders
- Dashboard UI Phase 2 completed — collapsible sidebar with item types, favorite/all collections, user avatar, mobile drawer
- Dashboard UI Phase 3 completed — 4 stats cards, recent collections grid, pinned items section, 10 most recent items list
