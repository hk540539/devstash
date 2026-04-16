import {
  File,
  FileImage,
  FileCode,
  FileText,
  FileArchive,
  FileAudio,
  FileVideo,
  type LucideIcon,
} from "lucide-react";

export const EXTENSION_ICONS: Record<string, LucideIcon> = {
  // Images
  jpg: FileImage, jpeg: FileImage, png: FileImage, gif: FileImage,
  webp: FileImage, svg: FileImage, ico: FileImage,
  // Code
  js: FileCode, ts: FileCode, jsx: FileCode, tsx: FileCode,
  py: FileCode, rb: FileCode, go: FileCode, rs: FileCode,
  java: FileCode, cpp: FileCode, c: FileCode, cs: FileCode,
  php: FileCode, sh: FileCode,
  // Documents
  pdf: FileText, doc: FileText, docx: FileText, txt: FileText,
  md: FileText, csv: FileText, xls: FileText, xlsx: FileText,
  // Archives
  zip: FileArchive, tar: FileArchive, gz: FileArchive,
  rar: FileArchive, "7z": FileArchive,
  // Audio
  mp3: FileAudio, wav: FileAudio, ogg: FileAudio, flac: FileAudio,
  // Video
  mp4: FileVideo, mov: FileVideo, avi: FileVideo, mkv: FileVideo, webm: FileVideo,
};

export function getExtensionIcon(fileName: string | null): LucideIcon {
  if (!fileName) return File;
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_ICONS[ext] ?? File;
}
