# Item Types

Reference documentation for all 7 system item types in DevStash.

---

## Per-Type Reference

### Snippet

| Field             | Value                          |
|-------------------|--------------------------------|
| ID                | `snippet`                      |
| Icon (DB)         | `"Code"`                       |
| Lucide component  | `<Code />`                     |
| Color             | `#3b82f6` (blue)               |

**Purpose**: Store reusable code fragments — hooks, utilities, patterns, templates.

**Key fields used**:
- `contentType`: `"text"`
- `content`: the code body
- `language`: programming language for syntax highlighting (e.g. `"typescript"`, `"dockerfile"`)
- `description`: brief summary of what the snippet does

---

### Prompt

| Field             | Value                          |
|-------------------|--------------------------------|
| ID                | `prompt`                       |
| Icon (DB)         | `"Sparkles"`                   |
| Lucide component  | `<Sparkles />`                 |
| Color             | `#8b5cf6` (violet)             |

**Purpose**: Store AI prompts, system instructions, and workflow templates for LLMs.

**Key fields used**:
- `contentType`: `"text"`
- `content`: the prompt body (supports Markdown with fenced code placeholders)
- `description`: what the prompt is designed to do

---

### Command

| Field             | Value                          |
|-------------------|--------------------------------|
| ID                | `command`                      |
| Icon (DB)         | `"Terminal"`                   |
| Lucide component  | `<Terminal />`                 |
| Color             | `#f97316` (orange)             |

**Purpose**: Store shell commands, CLI one-liners, and scripts for quick copy-paste use.

**Key fields used**:
- `contentType`: `"text"`
- `content`: the command string
- `description`: what the command does and any caveats (flags, platform, prerequisites)

---

### Note

| Field             | Value                          |
|-------------------|--------------------------------|
| ID                | `note`                         |
| Icon (DB)         | `"StickyNote"`                 |
| Lucide component  | `<StickyNote />`               |
| Color             | `#fde047` (yellow)             |

**Purpose**: Free-form text notes, documentation fragments, meeting notes, or Markdown documents.

**Key fields used**:
- `contentType`: `"text"`
- `content`: Markdown body
- `description`: optional short summary

---

### File

| Field             | Value                          |
|-------------------|--------------------------------|
| ID                | `file`                         |
| Icon (DB)         | `"File"`                       |
| Lucide component  | `<File />`                     |
| Color             | `#6b7280` (gray)               |

**Purpose**: Store uploaded binary files — PDFs, ZIPs, templates, config files, etc.

**Key fields used**:
- `contentType`: `"file"`
- `fileUrl`: Cloudflare R2 URL of the uploaded file
- `fileName`: original filename for display
- `fileSize`: size in bytes
- `description`: optional label

> Pro tier only per spec.

---

### Image

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| ID                | `image`                                            |
| Icon (DB)         | `"Image"`                                          |
| Lucide component  | `<Image />` (imported as `ImageIcon` to avoid conflicts) |
| Color             | `#ec4899` (pink)                                   |

**Purpose**: Store uploaded images — screenshots, diagrams, UI mockups, reference visuals.

**Key fields used**:
- `contentType`: `"file"`
- `fileUrl`: Cloudflare R2 URL of the uploaded image
- `fileName`: original filename
- `fileSize`: size in bytes
- `description`: optional caption

---

### Link

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| ID                | `link`                                             |
| Icon (DB)         | `"Link"`                                           |
| Lucide component  | `<Link2 />` (mapped via `ICON_MAP` to avoid conflict with Next.js `<Link>`) |
| Color             | `#10b981` (emerald)                                |

**Purpose**: Bookmark external URLs — documentation, tools, references, articles.

**Key fields used**:
- `contentType`: `"text"`
- `url`: the external URL
- `description`: what the link points to
- `content`: not used (null)

---

## Summary Tables

### Classification by Content Type

| Type    | `contentType` | Uses `content` | Uses `url` | Uses `fileUrl/fileName/fileSize` | Uses `language` |
|---------|:-------------:|:--------------:|:----------:|:--------------------------------:|:---------------:|
| Snippet | `text`        | ✓              |            |                                  | ✓               |
| Prompt  | `text`        | ✓              |            |                                  |                 |
| Command | `text`        | ✓              |            |                                  |                 |
| Note    | `text`        | ✓              |            |                                  |                 |
| Link    | `text`        |                | ✓          |                                  |                 |
| File    | `file`        |                |            | ✓                                |                 |
| Image   | `file`        |                |            | ✓                                |                 |

### Shared Properties (all types)

Every item, regardless of type, has these fields from the `Item` model:

| Field         | Purpose                                     |
|---------------|---------------------------------------------|
| `title`       | Display name                                |
| `description` | Short summary (optional)                    |
| `isFavorite`  | Starred by the user                         |
| `isPinned`    | Pinned to the dashboard                     |
| `tags`        | Many-to-many via `ItemTag` join table       |
| `collectionId`| Optional membership in a `Collection`      |
| `createdAt`   | Creation timestamp                          |
| `updatedAt`   | Last modification timestamp                 |

### Display Differences

| Type    | Card preview                                  | Copy/action target  |
|---------|-----------------------------------------------|---------------------|
| Snippet | Code block with syntax highlighting (excerpt) | `content`           |
| Prompt  | Truncated plain text                          | `content`           |
| Command | Monospace one-liner                           | `content`           |
| Note    | Truncated Markdown as plain text              | `content`           |
| Link    | Styled URL anchor / metadata card             | `url`               |
| File    | Filename + formatted file size                | `fileUrl` (download)|
| Image   | Thumbnail preview                             | `fileUrl`           |

---

## Implementation Notes

- **Fixed IDs**: System types are seeded with fixed `id` strings (`"snippet"`, `"prompt"`, etc.) so they can be referenced by string throughout the codebase without a lookup query.
- **`isSystem: true`**: Distinguishes built-in types from user-created Pro custom types (`isSystem: false`, `userId` set).
- **`ICON_MAP`** in [src/lib/icons.ts](../src/lib/icons.ts): maps the DB `icon` string to a Lucide React component. `"Link"` maps to `Link2` to avoid conflicting with Next.js's `<Link>`. `"Image"` is imported as `ImageIcon` for the same reason.
- **Icon/color source of truth**: values stored in the DB on the `ItemType` record; UI always reads from `item.type.icon` and `item.type.color` — never hardcoded in components.
- **Pro gating**: File uploads (type `"file"`) are Pro-only per spec. Image uploads are available on the free tier.
- **Command type omitted from sidebar order** in the current `SIDEBAR_TYPE_ORDER` config in `items.ts` — this appears intentional or an oversight to address when building the items list view.
