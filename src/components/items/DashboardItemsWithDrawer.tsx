"use client";

import { useState } from "react";
import { Pin } from "lucide-react";
import { ItemRow } from "./ItemRow";
import { ItemDrawer } from "./ItemDrawer";
import type { ItemWithMeta } from "@/lib/db/items";

interface DashboardItemsWithDrawerProps {
  pinnedItems: ItemWithMeta[];
  recentItems: ItemWithMeta[];
}

export function DashboardItemsWithDrawer({
  pinnedItems,
  recentItems,
}: DashboardItemsWithDrawerProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  return (
    <>
      {/* Pinned */}
      {pinnedItems.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Pin className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Pinned</h2>
          </div>
          <div className="space-y-2">
            {pinnedItems.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onClick={() => setSelectedItemId(item.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent Items */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Recent Items</h2>
        {recentItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items yet.</p>
        ) : (
          <div className="space-y-2">
            {recentItems.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onClick={() => setSelectedItemId(item.id)}
              />
            ))}
          </div>
        )}
      </section>

      <ItemDrawer
        itemId={selectedItemId}
        open={selectedItemId !== null}
        onClose={() => setSelectedItemId(null)}
      />
    </>
  );
}