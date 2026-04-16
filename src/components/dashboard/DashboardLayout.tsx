'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { PanelLeft, Search, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NewItemDialog } from '@/components/items/NewItemDialog'
import { SidebarBody } from './SidebarBody'
import { UserAvatar } from './UserAvatar'
import { UserFooter } from './UserFooter'
import type { SidebarItemType } from '@/lib/db/items'
import type { CollectionWithMeta } from '@/lib/db/collections'

interface DashboardLayoutProps {
  children: React.ReactNode
  itemTypes: SidebarItemType[]
  collections: CollectionWithMeta[]
  user: { name: string; email: string; image?: string | null }
  signOutAction: () => Promise<void>
}

export function DashboardLayout({ children, itemTypes, collections, user, signOutAction }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

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
                  <UserFooter name={user.name} email={user.email} image={user.image} signOutAction={signOutAction} />
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
            <NewItemDialog itemTypes={itemTypes} />
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
                <UserFooter name={user.name} email={user.email} image={user.image} signOutAction={signOutAction} />
              ) : (
                <Tooltip>
                  <TooltipTrigger render={<span className="cursor-pointer" />}>
                    <UserAvatar name={user.name} image={user.image} />
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
