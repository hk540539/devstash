"use client";

import { Star, Pin } from "lucide-react";
import { getIcon } from "@/lib/icons";
import type { ItemWithMeta } from "@/lib/db/items";

interface ItemRowProps {
  item: ItemWithMeta;
  onClick?: () => void;
}

export function ItemRow({ item, onClick }: ItemRowProps) {
  const iconColor = item.type.color;
  const Icon = getIcon(item.type.icon);

  const date = new Date(item.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 border-l-[3px] cursor-pointer hover:bg-muted/40 transition-colors"
      style={{ borderLeftColor: iconColor }}
      onClick={onClick}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: `${iconColor}20` }}
      >
        <Icon className="h-4 w-4" style={{ color: iconColor }} />
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
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {item.description}
          </p>
        )}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
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
      <span className="shrink-0 text-xs text-muted-foreground pt-0.5">
        {date}
      </span>
    </div>
  );
}