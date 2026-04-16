"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getIcon } from "@/lib/icons";
import { deleteItem } from "@/actions/items";
import type { ItemDetail } from "@/lib/db/items";
import { ItemDrawerSkeleton } from "./ItemDrawerSkeleton";
import { ItemDrawerDetail } from "./ItemDrawerDetail";
import { ItemDrawerEdit } from "./ItemDrawerEdit";

interface ItemDrawerProps {
  itemId: string | null;
  open: boolean;
  onClose: () => void;
}

export function ItemDrawer({ itemId, open, onClose }: ItemDrawerProps) {
  const router = useRouter();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!itemId || !open) {
      setItem(null);
      setEditing(false);
      return;
    }

    setLoading(true);
    setItem(null);
    setEditing(false);

    fetch(`/api/items/${itemId}`)
      .then((res) => res.json())
      .then((data: ItemDetail) => setItem(data))
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [itemId, open]);

  function handleClose() {
    setEditing(false);
    onClose();
  }

  function handleSaved(updated: ItemDetail) {
    setItem(updated);
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!item) return;
    const result = await deleteItem(item.id);
    if (result.success) {
      toast.success("Item deleted");
      handleClose();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  const Icon = item ? getIcon(item.type.icon) : null;
  const color = item?.type.color;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <SheetContent
        side="right"
        showCloseButton
        className="w-full sm:max-w-md flex flex-col gap-0 p-0"
      >
        <SheetHeader className="px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2 pr-8">
            {Icon && color ? (
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
            ) : (
              <div className="h-7 w-7 rounded-md bg-muted animate-pulse" />
            )}
            {item ? (
              <div className="flex items-center gap-2 min-w-0">
                <SheetTitle className="truncate">{item.title}</SheetTitle>
                <span
                  className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {item.type.name}
                </span>
                {item.language && (
                  <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {item.language}
                  </span>
                )}
              </div>
            ) : (
              <div className="h-4 w-40 rounded bg-muted animate-pulse" />
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          {loading || (!item && open) ? (
            <ItemDrawerSkeleton />
          ) : item && editing ? (
            <ItemDrawerEdit
              item={item}
              onCancel={() => setEditing(false)}
              onSaved={handleSaved}
            />
          ) : item ? (
            <ItemDrawerDetail item={item} onEdit={() => setEditing(true)} onDelete={handleDelete} />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
