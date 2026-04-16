"use client";

import { Star, Pin } from "lucide-react";
import type { ItemWithMeta } from "@/lib/db/items";

interface ImageThumbnailCardProps {
  item: ItemWithMeta;
  onClick?: () => void;
}

export function ImageThumbnailCard({ item, onClick }: ImageThumbnailCardProps) {
  const imageUrl = item.fileUrl
    ? `/api/download/${item.fileUrl}?name=${encodeURIComponent(item.fileName ?? "image")}`
    : null;

  return (
    <div
      className="group rounded-lg border border-border bg-card overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="aspect-video w-full overflow-hidden bg-muted">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={item.fileName ?? item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
            No preview
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 flex items-center gap-1.5 min-w-0">
        <span className="flex-1 text-xs font-medium truncate">{item.title}</span>
        {item.isFavorite && (
          <Star className="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400" />
        )}
        {item.isPinned && (
          <Pin className="h-3 w-3 shrink-0 text-muted-foreground" />
        )}
      </div>
    </div>
  );
}
