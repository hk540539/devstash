'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Search,
  Plus,
  PanelLeft,
  Star,
  ChevronDown,
  ChevronRight,
  Menu,
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
import { cn } from '@/lib/utils'
import type { SidebarItemType } from '@/lib/db/items'
import type { CollectionWithMeta } from '@/lib/db/collections'

const ICON_MAP: Record<string, LucideIcon> = {
  Code: Code,
  Sparkles: Sparkles,
  Terminal: Terminal,
  StickyNote: StickyNote,
  File: File,
  Image: ImageIcon,
  Link: Link2,
  // legacy names
  'code-xml': CodeXml,
  sparkles: Sparkles,
  terminal: Terminal,
  notebook: Notebook,
  file: File,
  image: ImageIcon,
  link: Link2,
}

function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? File
}

interface SidebarBodyProps {
  isCollapsed: boolean
  itemTypes: SidebarItemType[]
  collections: CollectionWithMeta[]
}

function SidebarBody({ isCollapsed, itemTypes, collections }: SidebarBodyProps) {
  const [typesOpen, setTypesOpen] = useState(true)
  const [collectionsOpen, setCollectionsOpen] = useState(true)

  const favoriteCollections = collections.filter((c) => c.isFavorite)
  const recentCollections = collections.filter((c) => !c.isFavorite)

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-0.5 py-2">
        {itemTypes.map((type) => {
          const Icon = getIcon(type.icon)
          return (
            <Tooltip key={type.id}>
              <TooltipTrigger
                render={
                  <Link
                    href={`/items/${type.slug}`}
                    className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-sidebar-accent"
                  />
                }
              >
                <Icon className="h-4 w-4" style={{ color: type.color }} />
              </TooltipTrigger>
              <TooltipContent side="right">
                {type.name} ({type.count})
              </TooltipContent>
            </Tooltip>
          )
        })}

        <Separator className="w-8 my-1" />

        {favoriteCollections.map((col) => (
          <Tooltip key={col.id}>
            <TooltipTrigger
              render={
                <Link
                  href={`/collections/${col.id}`}
                  className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-sidebar-accent"
                />
              }
            >
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </TooltipTrigger>
            <TooltipContent side="right">{col.name}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0.5 py-2">
      {/* Types */}
      <button
        onClick={() => setTypesOpen((prev) => !prev)}
        className="flex w-full items-center gap-1 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        {typesOpen ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        Types
      </button>

      {typesOpen && (
        <div className="mb-1 px-2">
          {itemTypes.map((type) => {
            const Icon = getIcon(type.icon)
            return (
              <Link
                key={type.id}
                href={`/items/${type.slug}`}
                className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Icon className="h-4 w-4 shrink-0" style={{ color: type.color }} />
                <span className="flex-1">{type.name}</span>
                {type.isPro && (
                  <Badge variant="outline" className="h-4 px-1 text-[10px] font-semibold text-muted-foreground border-muted-foreground/30">
                    PRO
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">{type.count}</span>
              </Link>
            )
          })}
        </div>
      )}

      <Separator className="my-1 mx-2" />

      {/* Collections */}
      <button
        onClick={() => setCollectionsOpen((prev) => !prev)}
        className="flex w-full items-center gap-1 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        {collectionsOpen ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        Collections
      </button>

      {collectionsOpen && (
        <div className="px-2">
          {favoriteCollections.length > 0 && (
            <>
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                Favorites
              </p>
              {favoriteCollections.map((col) => (
                <Link
                  key={col.id}
                  href={`/collections/${col.id}`}
                  className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
                  <span className="flex-1 truncate">{col.name}</span>
                </Link>
              ))}
            </>
          )}

          {recentCollections.length > 0 && (
            <>
              <p className="mt-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                Recent
              </p>
              {recentCollections.map((col) => (
                <Link
                  key={col.id}
                  href={`/collections/${col.id}`}
                  className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: col.dominantColor }}
                  />
                  <span className="flex-1 truncate">{col.name}</span>
                  <span className="text-xs text-muted-foreground">{col.itemCount}</span>
                </Link>
              ))}
            </>
          )}

          <Link
            href="/collections"
            className="mt-1 flex items-center gap-2.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            View all collections
          </Link>
        </div>
      )}
    </div>
  )
}

interface UserFooterProps {
  name: string
  email: string
  initials: string
}

function UserFooter({ name, email, initials }: UserFooterProps) {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{email}</p>
      </div>
    </div>
  )
}

interface DashboardLayoutProps {
  children: React.ReactNode
  itemTypes: SidebarItemType[]
  collections: CollectionWithMeta[]
  user: { name: string; email: string }
}

export function DashboardLayout({ children, itemTypes, collections, user }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const userInitials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')

  return (
    <TooltipProvider delay={300}>
      <div className="flex h-screen flex-col">
        {/* Topbar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
          {/* Mobile menu trigger */}
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" className="md:hidden h-9 w-9" />}
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0 bg-sidebar">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div className="flex h-full flex-col">
                <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
                    S
                  </div>
                  <span className="font-semibold">DevStash</span>
                </div>
                <div className="flex-1 overflow-auto">
                  <SidebarBody isCollapsed={false} itemTypes={itemTypes} collections={collections} />
                </div>
                <div className="border-t border-sidebar-border p-3">
                  <UserFooter name={user.name} email={user.email} initials={userInitials} />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search items..." className="pl-9" />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              New Collection
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Item</span>
            </Button>
          </div>
        </header>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop sidebar */}
          <aside
            className={cn(
              'hidden md:flex flex-col shrink-0 border-r border-sidebar-border bg-sidebar overflow-hidden transition-[width] duration-200 ease-in-out',
              isSidebarOpen ? 'w-60' : 'w-[60px]'
            )}
          >
            <div
              className={cn(
                'flex h-14 shrink-0 items-center border-b border-sidebar-border',
                isSidebarOpen ? 'justify-between px-4' : 'justify-center'
              )}
            >
              {isSidebarOpen && (
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
                    S
                  </div>
                  <span className="font-semibold">DevStash</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-sidebar-foreground"
                onClick={() => setIsSidebarOpen((prev) => !prev)}
              >
                <PanelLeft
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    !isSidebarOpen && 'rotate-180'
                  )}
                />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <SidebarBody isCollapsed={!isSidebarOpen} itemTypes={itemTypes} collections={collections} />
            </div>

            <div
              className={cn(
                'border-t border-sidebar-border',
                isSidebarOpen ? 'p-3' : 'flex justify-center p-2'
              )}
            >
              {isSidebarOpen ? (
                <UserFooter name={user.name} email={user.email} initials={userInitials} />
              ) : (
                <Tooltip>
                  <TooltipTrigger render={<span className="cursor-pointer" />}>
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </aside>

          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  )
}
