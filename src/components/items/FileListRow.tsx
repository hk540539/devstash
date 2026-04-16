"use client";

import { Download, FileText, FileImage, FileCode, FileArchive, FileAudio, FileVideo, File } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ItemWithMeta } from "@/lib/db/items";

const EXTENSION_ICONS: Record<string, LucideIcon> = {
  // Images
  jpg: FileImage, jpeg: FileImage, png: FileImage, gif: FileImage, webp: FileImage, svg: FileImage, ico: FileImage,
  // Code
  js: FileCode, ts: FileCode, jsx: FileCode, tsx: FileCode, py: FileCode, rb: FileCode, go: FileCode,
  rs: FileCode, java: FileCode, cpp: FileCode, c: FileCode, cs: FileCode, php: FileCode, sh: FileCode,
  // Documents
  pdf: FileText, doc: FileText, docx: FileText, txt: FileText, md: FileText, csv: FileText, xls: FileText, xlsx: FileText,
  // Archives
  zip: FileArchive, tar: FileArchive, gz: FileArchive, rar: FileArchive, "7z": FileArchive,
  // Audio
  mp3: FileAudio, wav: FileAudio, ogg: FileAudio, flac: FileAudio,
  // Video
  mp4: FileVideo, mov: FileVideo, avi: FileVideo, mkv: FileVideo, webm: FileVideo,
};

function getExtensionIcon(fileName: string | null): LucideIcon {
  if (!fileName) return File;
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_ICONS[ext] ?? File;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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
