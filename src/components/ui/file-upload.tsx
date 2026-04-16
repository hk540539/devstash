"use client";

import { useRef, useState, useCallback } from "react";
import { UploadCloud, X, File as FileIcon, Image as ImageIcon, Download } from "lucide-react";
import { ALLOWED_FILE_TYPES, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/s3";

export type UploadResult = {
  key: string;
  fileName: string;
  fileSize: number;
  contentType: string;
};

interface FileUploadProps {
  itemType: "File" | "Image";
  onUploaded: (result: UploadResult) => void;
  onClear: () => void;
  uploaded: UploadResult | null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({ itemType, onUploaded, onClear, uploaded }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allowedTypes = itemType === "Image" ? ALLOWED_IMAGE_TYPES : ALLOWED_FILE_TYPES;
  const acceptAttr = Object.keys(allowedTypes).join(",");
  const isImage = itemType === "Image";

  async function uploadFile(file: File) {
    setError(null);

    if (file.size > MAX_FILE_SIZE) {
      setError("File exceeds 5 MB limit");
      return;
    }
    if (!allowedTypes[file.type]) {
      setError(`File type "${file.type}" is not allowed`);
      return;
    }

    const form = new FormData();
    form.append("file", file);
    form.append("itemType", itemType);

    setProgress(0);

    // Use XHR for progress tracking
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const result: UploadResult = JSON.parse(xhr.responseText);
          onUploaded(result);
          setProgress(null);
          resolve();
        } else {
          const body = JSON.parse(xhr.responseText);
          reject(new Error(body.error ?? "Upload failed"));
        }
      };

      xhr.onerror = () => reject(new Error("Upload failed"));

      xhr.open("POST", "/api/upload");
      xhr.send(form);
    }).catch((err: Error) => {
      setError(err.message);
      setProgress(null);
    });
  }

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      uploadFile(files[0]);
    },
    [itemType], // eslint-disable-line react-hooks/exhaustive-deps
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  if (uploaded) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 px-3 py-2.5">
        {isImage ? (
          <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium">{uploaded.fileName}</p>
          <p className="text-xs text-muted-foreground">{formatBytes(uploaded.fileSize)}</p>
        </div>
        <a
          href={`/api/download/${uploaded.key}?name=${encodeURIComponent(uploaded.fileName)}`}
          download={uploaded.fileName}
          className="shrink-0 rounded p-0.5 hover:bg-muted transition-colors text-muted-foreground"
          title="Download"
        >
          <Download className="h-4 w-4" />
        </a>
        <button
          type="button"
          onClick={() => { onClear(); setError(null); }}
          className="shrink-0 rounded p-0.5 hover:bg-muted transition-colors text-muted-foreground"
          title="Remove file"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div
        role="button"
        tabIndex={0}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-6 text-center cursor-pointer transition-colors ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground/50 hover:bg-muted/30"
        } ${progress !== null ? "pointer-events-none opacity-70" : ""}`}
      >
        <UploadCloud className="h-7 w-7 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">
            {progress !== null ? `Uploading… ${progress}%` : "Drop file here or click to browse"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isImage
              ? "PNG, JPG, GIF, WebP, SVG — max 5 MB"
              : "PDF, TXT, MD, JSON, YAML, XML, CSV, TOML — max 5 MB"}
          </p>
        </div>
        {progress !== null && (
          <div className="w-full max-w-xs rounded-full bg-muted h-1.5 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={acceptAttr}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}