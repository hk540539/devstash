"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Star,
  Pin,
  Copy,
  Pencil,
  Trash2,
  FolderOpen,
  CalendarDays,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { getIcon } from "@/lib/icons";
import { updateItem } from "@/actions/items";
import type { ItemDetail } from "@/lib/db/items";

// ── Type helpers ──────────────────────────────────────────────────────────────

const CONTENT_TYPES = ["Snippet", "Prompt", "Command", "Note"];
const LANGUAGE_TYPES = ["Snippet", "Command"];
const URL_TYPES = ["Link"];

// ── Skeleton ──────────────────────────────────────────────────────────────────

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 animate-pulse">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-7 w-16 rounded-md bg-muted" />
        ))}
        <div className="ml-auto h-7 w-16 rounded-md bg-muted" />
      </div>
      <Separator />
      <div className="space-y-2">
        <div className="h-3 w-20 rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="h-28 rounded-md bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-10 rounded bg-muted" />
        <div className="flex gap-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-5 w-12 rounded-full bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── View mode ─────────────────────────────────────────────────────────────────

function DrawerDetail({
  item,
  onEdit,
}: {
  item: ItemDetail;
  onEdit: () => void;
}) {
  const createdDate = new Date(item.createdAt).toLocaleDateString("en-US", {

    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const updatedDate = new Date(item.updatedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-0 overflow-y-auto h-full">
      {/* Action bar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border shrink-0">
        <button
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
          title="Favorite"
        >
          <Star
            className={`h-3.5 w-3.5 ${item.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
          />
          <span className={item.isFavorite ? "text-yellow-400" : "text-muted-foreground"}>
            Favorite
          </span>
        </button>
        <button
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium hover:bg-muted transition-colors text-muted-foreground"
          title="Pin"
        >
          <Pin className="h-3.5 w-3.5" />
          <span>Pin</span>
        </button>
        <button
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium hover:bg-muted transition-colors text-muted-foreground"
          title="Copy"
        >
          <Copy className="h-3.5 w-3.5" />
          <span>Copy</span>
        </button>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium hover:bg-muted transition-colors text-muted-foreground"
          title="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span>Edit</span>
        </button>
        <button
          className="ml-auto flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium hover:bg-destructive/10 transition-colors text-destructive"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex flex-col gap-5 p-4 overflow-y-auto">
        {item.description && (
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Description
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {item.description}
            </p>
          </section>
        )}

        {item.content && (
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Content
            </p>
            <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-words leading-relaxed">
              {item.content}
            </pre>
          </section>
        )}

        {item.url && (
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              URL
            </p>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline break-all"
            >
              {item.url}
            </a>
          </section>
        )}

        {item.tags.length > 0 && (
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {item.collection && (
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Collections
            </p>
            <div className="flex items-center gap-1.5">
              <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm">{item.collection.name}</span>
            </div>
          </section>
        )}

        <section>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Details
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground w-16 shrink-0">Created</span>
              <span>{createdDate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground w-16 shrink-0">Updated</span>
              <span>{updatedDate}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// ── Edit mode ─────────────────────────────────────────────────────────────────

type EditForm = {
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tags: string; // comma-separated
};

function DrawerEdit({
  item,
  onCancel,
  onSaved,
}: {
  item: ItemDetail;
  onCancel: () => void;
  onSaved: (updated: ItemDetail) => void;
}) {
  const [form, setForm] = useState<EditForm>({
    title: item.title,
    description: item.description ?? "",
    content: item.content ?? "",
    url: item.url ?? "",
    language: item.language ?? "",
    tags: item.tags.join(", "),
  });
  const [saving, setSaving] = useState(false);

  const typeName = item.type.name;
  const showContent = CONTENT_TYPES.includes(typeName);
  const showLanguage = LANGUAGE_TYPES.includes(typeName);
  const showUrl = URL_TYPES.includes(typeName);

  function set(field: keyof EditForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSave() {
    setSaving(true);
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await updateItem(item.id, {
      title: form.title,
      description: form.description || null,
      content: form.content || null,
      url: form.url || null,
      language: form.language || null,
      tags,
    });

    setSaving(false);

    if (result.success) {
      toast.success("Item saved");
      onSaved(result.data);
    } else {
      toast.error(result.error);
    }
  }

  const canSave = form.title.trim().length > 0 && !saving;

  const inputCls =
    "w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring placeholder:text-muted-foreground";
  const labelCls =
    "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1";

  return (
    <div className="flex flex-col h-full">
      {/* Save / Cancel bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border shrink-0">
        <button
          onClick={onCancel}
          className="rounded-md px-3 py-1.5 text-xs font-medium border border-border hover:bg-muted transition-colors"
          disabled={saving}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="rounded-md px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {/* Form fields */}
      <div className="flex flex-col gap-4 p-4 overflow-y-auto">
        {/* Title */}
        <div>
          <p className={labelCls}>Title *</p>
          <input
            className={inputCls}
            value={form.title}
            onChange={set("title")}
            placeholder="Item title"
          />
        </div>

        {/* Description */}
        <div>
          <p className={labelCls}>Description</p>
          <textarea
            className={`${inputCls} resize-none`}
            rows={2}
            value={form.description}
            onChange={set("description")}
            placeholder="Optional description"
          />
        </div>

        {/* Content (type-specific) */}
        {showContent && (
          <div>
            <p className={labelCls}>Content</p>
            <textarea
              className={`${inputCls} font-mono resize-none`}
              rows={8}
              value={form.content}
              onChange={set("content")}
              placeholder="Paste your content here"
            />
          </div>
        )}

        {/* URL (type-specific) */}
        {showUrl && (
          <div>
            <p className={labelCls}>URL</p>
            <input
              className={inputCls}
              type="url"
              value={form.url}
              onChange={set("url")}
              placeholder="https://example.com"
            />
          </div>
        )}

        {/* Language (type-specific) */}
        {showLanguage && (
          <div>
            <p className={labelCls}>Language</p>
            <input
              className={inputCls}
              value={form.language}
              onChange={set("language")}
              placeholder="e.g. typescript"
            />
          </div>
        )}

        {/* Tags */}
        <div>
          <p className={labelCls}>Tags</p>
          <input
            className={inputCls}
            value={form.tags}
            onChange={set("tags")}
            placeholder="react, auth, hooks"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Separate tags with commas
          </p>
        </div>

        {/* Non-editable: type */}
        <div>
          <p className={labelCls}>Type</p>
          <p className="text-sm text-muted-foreground">{item.type.name}</p>
        </div>

        {/* Non-editable: collection */}
        {item.collection && (
          <div>
            <p className={labelCls}>Collection</p>
            <p className="text-sm text-muted-foreground">
              {item.collection.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface ItemDrawerProps {
  itemId: string | null;
  open: boolean;
  onClose: () => void;
}

export function ItemDrawer({ itemId, open, onClose }: ItemDrawerProps) {
  const router = useRouter();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!itemId || !open) {
      setItem(null);
      setEditing(false);
      return;
    }

    setLoading(true);
    setItem(null);
    setEditing(false);

    fetch(`/api/items/${itemId}`)
      .then((res) => res.json())
      .then((data: ItemDetail) => setItem(data))
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [itemId, open]);

  function handleClose() {
    setEditing(false);
    onClose();
  }

  function handleSaved(updated: ItemDetail) {
    setItem(updated);
    setEditing(false);
    router.refresh();
  }

  const Icon = item ? getIcon(item.type.icon) : null;
  const color = item?.type.color;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <SheetContent
        side="right"
        showCloseButton
        className="w-full sm:max-w-md flex flex-col gap-0 p-0"
      >
        {/* Header */}
        <SheetHeader className="px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2 pr-8">
            {Icon && color ? (
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
            ) : (
              <div className="h-7 w-7 rounded-md bg-muted animate-pulse" />
            )}
            {item ? (
              <div className="flex items-center gap-2 min-w-0">
                <SheetTitle className="truncate">{item.title}</SheetTitle>
                <span
                  className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {item.type.name}
                </span>
                {item.language && (
                  <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {item.language}
                  </span>
                )}
              </div>
            ) : (
              <div className="h-4 w-40 rounded bg-muted animate-pulse" />
            )}
          </div>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-hidden">
          {loading || (!item && open) ? (
            <DrawerSkeleton />
          ) : item && editing ? (
            <DrawerEdit
              item={item}
              onCancel={() => setEditing(false)}
              onSaved={handleSaved}
            />
          ) : item ? (
            <DrawerDetail item={item} onEdit={() => setEditing(true)} />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}