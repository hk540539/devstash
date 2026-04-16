"use client";

import { useState } from "react";
import { Star, Pin, Copy, Check } from "lucide-react";
import { getIcon } from "@/lib/icons";
import type { ItemWithMeta } from "@/lib/db/items";

interface ItemCardProps {
  item: ItemWithMeta;
  onClick?: () => void;
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const Icon = getIcon(item.type.icon);
  const color = item.type.color;
  const [copied, setCopied] = useState(false);

  const date = new Date(item.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    const text = item.content ?? item.url ?? item.title;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div
      className="group rounded-lg border border-border bg-card p-4 flex flex-col gap-2 border-l-[3px] cursor-pointer hover:bg-muted/40 transition-colors"
      style={{ borderLeftColor: color }}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm truncate">{item.title}</span>
            {item.isFavorite && (
              <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
            )}
            {item.isPinned && (
              <Pin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
          </div>
          {item.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 flex items-center justify-center h-6 w-6 rounded-md hover:bg-muted transition-all text-muted-foreground hover:text-foreground"
            title="Copy"
          >
            {copied
              ? <Check className="h-3.5 w-3.5 text-green-500" />
              : <Copy className="h-3.5 w-3.5" />
            }
          </button>
          <span className="text-xs text-muted-foreground pt-0.5">{date}</span>
        </div>
      </div>

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}