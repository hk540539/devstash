# Current Feature: Image Gallery View

## Status

In Progress

## Goals

- Replace the regular item card with an image thumbnail card on the `/items/images` page
- Show images in a 3-column grid/gallery layout
- Display each image with a 16:9 aspect ratio (`aspect-video`) using `object-cover` (may crop edges)
- Add a subtle hover zoom effect (5% scale, 300ms transition)

## Notes

- Only applies to the Images item type page — other item type pages keep the existing `ItemCard`
- The thumbnail should serve the image via the existing `/api/download/[...key]` proxy (authenticated)
- Keep the drawer open-on-click behavior intact (clicking a thumbnail still opens the `ItemDrawer`)

## History

- Markdown Editor completed — `MarkdownEditor` component with Write/Preview tabs, copy button, Monaco-matched scrollbar, 200px min / 400px max fluid height; `react-markdown` + `remark-gfm` + `@tailwindcss/typography` (`prose-invert`) for GFM rendering in dark theme; replaces textarea for Note and Prompt types in `NewItemDialog`, `DrawerEdit`, and `ItemDrawer` view mode (readonly)
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
- Email Verification Toggle completed — EMAIL_VERIFICATION_ENABLED env var (default true); centralised in src/lib/flags.ts; when false: user created as pre-verified, token/email skipped, sign-in check bypassed, success screen shows "Account created" instead of "Check your email"
- Forgot Password completed — "Forgot password?" link on sign-in; /forgot-password page sends reset email via Resend; /reset-password page validates token (prefixed identifier password-reset:<email>), hashes new password, deletes token in transaction; no user enumeration on forgot form; 1 hour token expiry; reuses VerificationToken model
- Profile Page completed — /profile route with clean URL; (app) route group created so /dashboard and /profile share the sidebar layout; AlertDialog component added from @base-ui/react; profile data fetching in src/lib/db/profile.ts; two-column layout with avatar, account details, usage stats (total + per type), change password (email users only), delete account with confirmation dialog
- Rate Limiting for Auth completed — Upstash Redis + @upstash/ratelimit sliding-window limits on sign-in (5/15min by IP+email), register (3/hr by IP), forgot-password (3/hr by IP), reset-password (5/15min by IP), new /api/auth/resend-verification route (3/15min by IP+email); reusable src/lib/rate-limit.ts utility; fails open when Redis is unavailable
- Items List View completed — dynamic `/items/[type]` route; `getItemsByType` + `getTypeLabelFromSlug` in `src/lib/db/items.ts`; `ItemCard` with colored left border; responsive 1→2→3 column grid; Command type added to SIDEBAR_TYPE_ORDER; Vitest set up for utilities and server actions (`npm test`)
- Item Drawer completed — right-side Sheet drawer opens on ItemCard/ItemRow click; `getItemById` + `ItemDetail` type in `src/lib/db/items.ts`; `GET /api/items/[id]` with auth check; skeleton loading state; action bar (Favorite yellow when active, Pin, Copy, Edit, Delete); description, content, URL, tags, collection, and details sections; `ItemsGridWithDrawer` client wrapper for items list page; `DashboardItemsWithDrawer` client wrapper for dashboard; `ItemRow` extracted to its own component
- Item Drawer Edit Mode completed — Edit button toggles inline edit mode in drawer; `DrawerEdit` with controlled inputs for title, description, tags, and type-specific fields (content/language/url); Save/Cancel bar replaces action bar; `updateItem` server action in `src/actions/items.ts` with Zod validation; `updateItemById` in `src/lib/db/items.ts` with transactional tag disconnect/reconnect; Sonner toasts on success/error; `router.refresh()` syncs card list after save
- Item Delete completed — Delete button in drawer opens AlertDialog confirmation; `deleteItem` server action with auth check; `deleteItemById` in `src/lib/db/items.ts`; Sonner toast on success; drawer closes and list refreshes via `router.refresh()`
- Item Create completed — "New Item" button in top bar opens Dialog modal; type selector (Snippet/Prompt/Command/Note/Link); conditional fields per type (content, language, URL); `createItem` server action with Zod validation; `createItemInDb` with transactional tag upsert; Dialog primitive built on `@base-ui/react`; toast on success and `router.refresh()`
- Code Editor completed — Monaco Editor (`@monaco-editor/react`) replaces Textarea for Snippet and Command types in drawer view, drawer edit, and New Item dialog; `CodeEditor` component with vs-dark theme, macOS traffic-light dots, copy button, language label, fluid height (150–400px); `CREATABLE_TYPES` extracted to `src/lib/item-types.ts` (server-safe); type-specific New Item button on `/items/[type]` pages with type preselected; vitest config fixed to use `vite-tsconfig-paths` as plugin
- File & Image Upload completed — `@aws-sdk/client-s3` + Supabase S3-compatible storage; `src/lib/s3.ts` singleton client; `POST /api/upload` with type/size validation (5 MB max); `GET /api/download/[...key]` authenticated proxy with ownership check; `FileUpload` component with drag-and-drop, XHR progress bar, post-upload download button; NewItemDialog supports File and Image types (upload required before create, type switch clears upload); ItemDrawer shows image preview and file name/size/download; `deleteItemById` cleans up S3 on item delete; Prisma transactions use `maxWait/timeout` for Neon serverless stability
