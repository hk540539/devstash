import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { getItemsByType, getTypeLabelFromSlug, getSidebarItemTypes } from "@/lib/db/items";
import { ItemsGridWithDrawer } from "@/components/items/ItemsGridWithDrawer";
import { NewItemDialog } from "@/components/items/NewItemDialog";
import { CREATABLE_TYPES, type CreatableType } from "@/lib/item-types";

export default async function ItemsByTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const label = getTypeLabelFromSlug(type);
  if (!label) notFound();

  // Derive singular db name from plural display label (e.g. "Snippets" → "Snippet")
  const singularName = label.slice(0, -1);
  const creatableType = (CREATABLE_TYPES as readonly string[]).includes(singularName)
    ? (singularName as CreatableType)
    : null;

  const [items, itemTypes] = await Promise.all([
    getItemsByType(session.user.id, type),
    creatableType ? getSidebarItemTypes(session.user.id) : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{label}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
        {creatableType && (
          <NewItemDialog itemTypes={itemTypes} defaultType={creatableType} />
        )}
      </div>

      <ItemsGridWithDrawer
        items={items}
        emptyMessage={`No ${label.toLowerCase()} yet.`}
      />
    </div>
  );
}