"use client";

import {
  Star,
  Pin,
  Copy,
  Pencil,
  Trash2,
  FolderOpen,
  CalendarDays,
  Download,
  File as FileIcon,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CodeEditor } from "@/components/ui/code-editor";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { formatBytes } from "@/lib/format";
import type { ItemDetail } from "@/lib/db/items";

const CODE_EDITOR_TYPES = ["Snippet", "Command"];
const MARKDOWN_TYPES = ["Note", "Prompt"];
const FILE_ITEM_TYPES = ["File", "Image"];

interface ItemDrawerDetailProps {
  item: ItemDetail;
  onEdit: () => void;
  onDelete: () => void;
}

export function ItemDrawerDetail({ item, onEdit, onDelete }: ItemDrawerDetailProps) {
  const isCodeType = CODE_EDITOR_TYPES.includes(item.type.name);
  const isMarkdownType = MARKDOWN_TYPES.includes(item.type.name);
  const isFileType = FILE_ITEM_TYPES.includes(item.type.name);
  const isImage = item.type.name === "Image";

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
        <AlertDialog>
          <AlertDialogTrigger
            className="ml-auto flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium hover:bg-destructive/10 transition-colors text-destructive"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete item?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete &ldquo;{item.title}&rdquo;. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogClose className="rounded-md px-3 py-1.5 text-sm font-medium border border-border hover:bg-muted transition-colors">
                Cancel
              </AlertDialogClose>
              <AlertDialogClose
                onClick={onDelete}
                className="rounded-md px-3 py-1.5 text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                Delete
              </AlertDialogClose>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Scrollable body */}
      <div className="flex flex-col gap-5 p-4 overflow-y-auto">
        {item.description && (
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Description
            </p>
            <p className="text-sm text-foreground leading-relaxed">{item.description}</p>
          </section>
        )}

        {item.content && (
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Content
            </p>
            {isCodeType ? (
              <CodeEditor value={item.content} language={item.language ?? "plaintext"} readOnly />
            ) : isMarkdownType ? (
              <MarkdownEditor value={item.content} readOnly />
            ) : (
              <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-words leading-relaxed">
                {item.content}
              </pre>
            )}
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

        {isFileType && item.fileUrl && (
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              {isImage ? "Image" : "File"}
            </p>
            {isImage ? (
              <div className="rounded-md overflow-hidden border border-border bg-muted/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/download/${item.fileUrl}?name=${encodeURIComponent(item.fileName ?? "image")}`}
                  alt={item.fileName ?? "image"}
                  className="max-h-64 w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 px-3 py-2.5">
                <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{item.fileName ?? "file"}</p>
                  {item.fileSize && (
                    <p className="text-xs text-muted-foreground">{formatBytes(item.fileSize)}</p>
                  )}
                </div>
                <a
                  href={`/api/download/${item.fileUrl}?name=${encodeURIComponent(item.fileName ?? "download")}`}
                  download={item.fileName ?? "download"}
                  className="shrink-0 flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium hover:bg-muted transition-colors text-muted-foreground"
                  title="Download"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </a>
              </div>
            )}
            {isImage && item.fileName && (
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {item.fileName}{item.fileSize ? ` · ${formatBytes(item.fileSize)}` : ""}
                </p>
                <a
                  href={`/api/download/${item.fileUrl}?name=${encodeURIComponent(item.fileName)}`}
                  download={item.fileName}
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium hover:bg-muted transition-colors text-muted-foreground"
                  title="Download"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </a>
              </div>
            )}
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
