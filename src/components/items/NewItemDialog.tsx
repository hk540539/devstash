"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createItem } from "@/actions/items";

// Types that can be created (File/Image excluded — Pro only)
const CREATABLE_TYPES = ["Snippet", "Prompt", "Command", "Note", "Link"] as const;
type CreatableType = (typeof CREATABLE_TYPES)[number];

const CONTENT_TYPES: CreatableType[] = ["Snippet", "Prompt", "Command", "Note"];
const LANGUAGE_TYPES: CreatableType[] = ["Snippet", "Command"];
const URL_TYPES: CreatableType[] = ["Link"];

type ItemTypeOption = { id: string; name: string; slug: string };

interface NewItemDialogProps {
  itemTypes: ItemTypeOption[];
}

type FormState = {
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tags: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  content: "",
  url: "",
  language: "",
  tags: "",
};

export function NewItemDialog({ itemTypes }: NewItemDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<CreatableType>("Snippet");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const showContent = CONTENT_TYPES.includes(selectedType);
  const showLanguage = LANGUAGE_TYPES.includes(selectedType);
  const showUrl = URL_TYPES.includes(selectedType);

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      setForm(EMPTY_FORM);
      setSelectedType("Snippet");
    }
    setOpen(isOpen);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const typeOption = itemTypes.find((t) => t.slug === selectedType.toLowerCase() + "s");
    if (!typeOption) {
      toast.error("Unknown item type");
      return;
    }

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setSaving(true);
    const result = await createItem({
      title: form.title,
      description: form.description || undefined,
      content: showContent ? form.content || undefined : undefined,
      url: showUrl ? form.url || undefined : undefined,
      language: showLanguage ? form.language || undefined : undefined,
      typeId: typeOption.id,
      tags,
    });
    setSaving(false);

    if (result.success) {
      toast.success("Item created");
      setOpen(false);
      setForm(EMPTY_FORM);
      setSelectedType("Snippet");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  const canSubmit =
    form.title.trim().length > 0 &&
    (!showUrl || form.url.trim().length > 0) &&
    !saving;

  const inputCls =
    "w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring placeholder:text-muted-foreground";
  const labelCls =
    "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">New Item</span>
      </Button>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 px-6 py-4">
            {/* Type selector */}
            <div>
              <p className={labelCls}>Type</p>
              <div className="flex flex-wrap gap-1.5">
                {CREATABLE_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium border transition-colors ${
                      selectedType === type
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <p className={labelCls}>Title *</p>
              <input
                className={inputCls}
                value={form.title}
                onChange={set("title")}
                placeholder="Item title"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <p className={labelCls}>Description</p>
              <textarea
                className={`${inputCls} resize-none`}
                rows={2}
                value={form.description}
                onChange={set("description")}
                placeholder="Optional description"
              />
            </div>

            {/* Content */}
            {showContent && (
              <div>
                <p className={labelCls}>Content</p>
                <textarea
                  className={`${inputCls} font-mono resize-none`}
                  rows={6}
                  value={form.content}
                  onChange={set("content")}
                  placeholder="Paste your content here"
                />
              </div>
            )}

            {/* URL */}
            {showUrl && (
              <div>
                <p className={labelCls}>URL *</p>
                <input
                  className={inputCls}
                  type="url"
                  value={form.url}
                  onChange={set("url")}
                  placeholder="https://example.com"
                />
              </div>
            )}

            {/* Language */}
            {showLanguage && (
              <div>
                <p className={labelCls}>Language</p>
                <input
                  className={inputCls}
                  value={form.language}
                  onChange={set("language")}
                  placeholder="e.g. typescript"
                />
              </div>
            )}

            {/* Tags */}
            <div>
              <p className={labelCls}>Tags</p>
              <input
                className={inputCls}
                value={form.tags}
                onChange={set("tags")}
                placeholder="react, auth, hooks"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Separate tags with commas
              </p>
            </div>
          </div>

          <DialogFooter>
            <DialogClose
              className="rounded-md px-3 py-1.5 text-sm font-medium border border-border hover:bg-muted transition-colors"
            >
              Cancel
            </DialogClose>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-md px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Creating…" : "Create"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}