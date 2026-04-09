import {
  Code,
  CodeXml,
  Sparkles,
  Terminal,
  Notebook,
  StickyNote,
  File,
  Image as ImageIcon,
  Link2,
  type LucideIcon,
} from 'lucide-react'

export const ICON_MAP: Record<string, LucideIcon> = {
  Code: Code,
  Sparkles: Sparkles,
  Terminal: Terminal,
  StickyNote: StickyNote,
  File: File,
  Image: ImageIcon,
  Link: Link2,
  // Legacy mock-data names
  'code-xml': CodeXml,
  sparkles: Sparkles,
  terminal: Terminal,
  notebook: Notebook,
  file: File,
  image: ImageIcon,
  link: Link2,
}

export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? File
}
