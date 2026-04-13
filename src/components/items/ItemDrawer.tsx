"use client";

import { useEffect, useState } from "react";
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
import type { ItemDetail } from "@/lib/db/items";

// ── Skeleton ──────────────────────────────────────────────────────────────────

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 animate-pulse">
      {/* Action bar */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-7 w-16 rounded-md bg-muted" />
        ))}
        <div className="ml-auto h-7 w-16 rounded-md bg-muted" />
      </div>
      <Separator />
      {/* Description */}
      <div className="space-y-2">
        <div className="h-3 w-20 rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
      </div>
      {/* Content */}
      <div className="space-y-2">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="h-28 rounded-md bg-muted" />
      </div>
      {/* Tags */}
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

// ── Detail content ─────────────────────────────────────────────────────────────

function DrawerDetail({ item }: { item: ItemDetail }) {
  const Icon = getIcon(item.type.icon);
  const color = item.type.color;

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
    <div className="flex flex-col gap-0 overflow-y-auto">
      {/* Action bar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border">
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
      <div className="flex flex-col gap-5 p-4">
        {/* Description */}
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

        {/* Content */}
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

        {/* URL */}
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

        {/* Tags */}
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

        {/* Collection */}
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

        {/* Details */}
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

// ── Main component ─────────────────────────────────────────────────────────────

interface ItemDrawerProps {
  itemId: string | null;
  open: boolean;
  onClose: () => void;
}

export function ItemDrawer({ itemId, open, onClose }: ItemDrawerProps) {
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!itemId || !open) {
      setItem(null);
      return;
    }

    setLoading(true);
    setItem(null);

    fetch(`/api/items/${itemId}`)
      .then((res) => res.json())
      .then((data: ItemDetail) => setItem(data))
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [itemId, open]);

  const Icon = item ? getIcon(item.type.icon) : null;
  const color = item?.type.color;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <SheetContent side="right" showCloseButton className="w-full sm:max-w-md flex flex-col gap-0 p-0">
        {/* Header */}
        <SheetHeader className="px-4 py-3 border-b border-border">
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
          ) : item ? (
            <DrawerDetail item={item} />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}