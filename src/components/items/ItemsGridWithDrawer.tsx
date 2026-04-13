"use client";

import { useState } from "react";
import { ItemCard } from "./ItemCard";
import { ItemDrawer } from "./ItemDrawer";
import type { ItemWithMeta } from "@/lib/db/items";

interface ItemsGridWithDrawerProps {
  items: ItemWithMeta[];
  emptyMessage?: string;
}

export function ItemsGridWithDrawer({
  items,
  emptyMessage = "No items yet.",
}: ItemsGridWithDrawerProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onClick={() => setSelectedItemId(item.id)}
          />
        ))}
      </div>
      <ItemDrawer
        itemId={selectedItemId}
        open={selectedItemId !== null}
        onClose={() => setSelectedItemId(null)}
      />
    </>
  );
}