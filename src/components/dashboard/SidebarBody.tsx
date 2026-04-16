"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getIcon } from "@/lib/icons";
import type { SidebarItemType } from "@/lib/db/items";
import type { CollectionWithMeta } from "@/lib/db/collections";

interface SidebarBodyProps {
  isCollapsed: boolean;
  itemTypes: SidebarItemType[];
  collections: CollectionWithMeta[];
}

export function SidebarBody({ isCollapsed, itemTypes, collections }: SidebarBodyProps) {
  const [typesOpen, setTypesOpen] = useState(true);
  const [collectionsOpen, setCollectionsOpen] = useState(true);

  const favoriteCollections = collections.filter((c) => c.isFavorite);
  const recentCollections = collections.filter((c) => !c.isFavorite);

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-0.5 py-2">
        {itemTypes.map((type) => {
          const Icon = getIcon(type.icon);
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
          );
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
    );
  }

  return (
    <div className="flex flex-col gap-0.5 py-2">
      {/* Types */}
      <button
        onClick={() => setTypesOpen((prev) => !prev)}
        className="flex w-full items-center gap-1 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        {typesOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        Types
      </button>

      {typesOpen && (
        <div className="mb-1 px-2">
          {itemTypes.map((type) => {
            const Icon = getIcon(type.icon);
            return (
              <Link
                key={type.id}
                href={`/items/${type.slug}`}
                className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Icon className="h-4 w-4 shrink-0" style={{ color: type.color }} />
                <span className="flex-1">{type.name}</span>
                {type.isPro && (
                  <Badge
                    variant="outline"
                    className="h-4 px-1 text-[10px] font-semibold text-muted-foreground border-muted-foreground/30"
                  >
                    PRO
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">{type.count}</span>
              </Link>
            );
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
  );
}
