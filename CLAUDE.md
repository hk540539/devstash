# DevStash

A developer knowledge hub for snippets, commands, prompts, notes, files, images, links and custom types.

## Context Files

Read the following to get the full context of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Commands

- **Dev server**: `npm run dev` (runs on http://localhost:3000)
- **Build**: `npm run build`
- **Production server**: `npm run start`
- **Lint**: `npm run lint`

**IMPORTANT:** Do not add Claude to any commit messages

## Neon MCP

When using the Neon MCP server, ALWAYS target:

- **Project**: `devstash` (id: `lingering-scene-30330530`)
- **Branch**: `development` (id: `br-nameless-moon-am6krxd8`)

Pass `projectId: "lingering-scene-30330530"` and `branchId: "br-nameless-moon-am6krxd8"` on every Neon MCP call (`run_sql`, `run_sql_transaction`, `describe_table_schema`, `get_database_tables`, migrations, etc.).

**NEVER touch the `production` branch** (`br-gentle-waterfall-ammjz3c9`) unless I explicitly say "production" in the request. This applies to reads and writes — no exploratory queries, schema inspection, or migrations against production without explicit permission.

If a task seems to require production, stop and ask first.
