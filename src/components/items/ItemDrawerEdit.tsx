"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CodeEditor } from "@/components/ui/code-editor";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { updateItem } from "@/actions/items";
import type { ItemDetail } from "@/lib/db/items";

const CONTENT_TYPES = ["Snippet", "Prompt", "Command", "Note"];
const LANGUAGE_TYPES = ["Snippet", "Command"];
const MARKDOWN_TYPES = ["Note", "Prompt"];
const URL_TYPES = ["Link"];
const CODE_EDITOR_TYPES = ["Snippet", "Command"];

type EditForm = {
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tags: string;
};

interface ItemDrawerEditProps {
  item: ItemDetail;
  onCancel: () => void;
  onSaved: (updated: ItemDetail) => void;
}

export function ItemDrawerEdit({ item, onCancel, onSaved }: ItemDrawerEditProps) {
  const [form, setForm] = useState<EditForm>({
    title: item.title,
    description: item.description ?? "",
    content: item.content ?? "",
    url: item.url ?? "",
    language: item.language ?? "",
    tags: item.tags.join(", "),
  });
  const [saving, setSaving] = useState(false);

  const typeName = item.type.name;
  const showContent = CONTENT_TYPES.includes(typeName);
  const showLanguage = LANGUAGE_TYPES.includes(typeName);
  const showUrl = URL_TYPES.includes(typeName);
  const useCodeEditor = CODE_EDITOR_TYPES.includes(typeName);
  const useMarkdownEditor = MARKDOWN_TYPES.includes(typeName);

  function set(field: keyof EditForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSave() {
    setSaving(true);
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await updateItem(item.id, {
      title: form.title,
      description: form.description || null,
      content: form.content || null,
      url: form.url || null,
      language: form.language || null,
      tags,
    });

    setSaving(false);

    if (result.success) {
      toast.success("Item saved");
      onSaved(result.data);
    } else {
      toast.error(result.error);
    }
  }

  const canSave = form.title.trim().length > 0 && !saving;

  const inputCls =
    "w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring placeholder:text-muted-foreground";
  const labelCls =
    "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1";

  return (
    <div className="flex flex-col h-full">
      {/* Save / Cancel bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border shrink-0">
        <button
          onClick={onCancel}
          className="rounded-md px-3 py-1.5 text-xs font-medium border border-border hover:bg-muted transition-colors"
          disabled={saving}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="rounded-md px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {/* Form fields */}
      <div className="flex flex-col gap-4 p-4 overflow-y-auto">
        <div>
          <p className={labelCls}>Title *</p>
          <input
            className={inputCls}
            value={form.title}
            onChange={set("title")}
            placeholder="Item title"
          />
        </div>

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

        {showContent && (
          <div>
            <p className={labelCls}>Content</p>
            {useCodeEditor ? (
              <CodeEditor
                value={form.content}
                onChange={(val) => setForm((prev) => ({ ...prev, content: val }))}
                language={form.language || "plaintext"}
              />
            ) : useMarkdownEditor ? (
              <MarkdownEditor
                value={form.content}
                onChange={(val) => setForm((prev) => ({ ...prev, content: val }))}
              />
            ) : (
              <textarea
                className={`${inputCls} font-mono resize-none`}
                rows={8}
                value={form.content}
                onChange={set("content")}
                placeholder="Paste your content here"
              />
            )}
          </div>
        )}

        {showUrl && (
          <div>
            <p className={labelCls}>URL</p>
            <input
              className={inputCls}
              type="url"
              value={form.url}
              onChange={set("url")}
              placeholder="https://example.com"
            />
          </div>
        )}

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

        <div>
          <p className={labelCls}>Tags</p>
          <input
            className={inputCls}
            value={form.tags}
            onChange={set("tags")}
            placeholder="react, auth, hooks"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">Separate tags with commas</p>
        </div>

        <div>
          <p className={labelCls}>Type</p>
          <p className="text-sm text-muted-foreground">{item.type.name}</p>
        </div>

        {item.collection && (
          <div>
            <p className={labelCls}>Collection</p>
            <p className="text-sm text-muted-foreground">{item.collection.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}
