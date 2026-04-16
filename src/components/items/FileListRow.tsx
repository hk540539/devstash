"use client";

import { Download } from "lucide-react";
import { getExtensionIcon } from "@/lib/file-utils";
import { formatBytes } from "@/lib/format";
import type { ItemWithMeta } from "@/lib/db/items";

interface FileListRowProps {
  item: ItemWithMeta;
  onClick?: () => void;
}

export function FileListRow({ item, onClick }: FileListRowProps) {
  const Icon = getExtensionIcon(item.fileName);

  const date = new Date(item.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const downloadUrl = item.fileUrl
    ? `/api/download/${item.fileUrl}?name=${encodeURIComponent(item.fileName ?? "download")}`
    : null;

  return (
    <div
      className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors"
      onClick={onClick}
    >
      {/* File icon */}
      <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.fileName ?? item.title}</p>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground sm:hidden">
          {item.fileSize != null && <span>{formatBytes(item.fileSize)}</span>}
          <span>{date}</span>
        </div>
      </div>

      {/* Size + date — hidden on mobile (shown inline above) */}
      <span className="hidden sm:block shrink-0 text-xs text-muted-foreground w-20 text-right">
        {item.fileSize != null ? formatBytes(item.fileSize) : "—"}
      </span>
      <span className="hidden sm:block shrink-0 text-xs text-muted-foreground w-28 text-right">
        {date}
      </span>

      {/* Download button */}
      {downloadUrl && (
        <a
          href={downloadUrl}
          download={item.fileName ?? "download"}
          className="shrink-0 flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          onClick={(e) => e.stopPropagation()}
          title="Download"
        >
          <Download className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}
