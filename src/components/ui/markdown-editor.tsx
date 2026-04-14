"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

export function MarkdownEditor({
  value,
  onChange,
  readOnly = false,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">(
    readOnly ? "preview" : "write"
  );
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#2d2d2d] border-b border-[#404040]">
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <div className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>

        {/* Tabs (only show in edit mode) */}
        {!readOnly && (
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => setTab("write")}
              className={`text-[11px] font-medium px-2 py-0.5 rounded transition-colors ${
                tab === "write"
                  ? "text-[#cccccc] bg-[#404040]"
                  : "text-[#858585] hover:text-[#cccccc]"
              }`}
            >
              Write
            </button>
            <button
              onClick={() => setTab("preview")}
              className={`text-[11px] font-medium px-2 py-0.5 rounded transition-colors ${
                tab === "preview"
                  ? "text-[#cccccc] bg-[#404040]"
                  : "text-[#858585] hover:text-[#cccccc]"
              }`}
            >
              Preview
            </button>
          </div>
        )}

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="ml-auto flex items-center gap-1 text-[11px] text-[#858585] hover:text-[#cccccc] transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>

      {/* Body */}
      <div className="bg-[#1e1e1e] min-h-[200px] max-h-[400px] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#4d4d4d_transparent] [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[rgba(121,121,121,0.4)] [&::-webkit-scrollbar-thumb]:rounded-sm hover:[&::-webkit-scrollbar-thumb]:bg-[rgba(100,100,100,0.7)]">
        {tab === "write" ? (
          <textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full h-full min-h-[200px] bg-transparent text-[#d4d4d4] text-sm font-mono p-3 resize-none outline-none placeholder:text-[#6b7280]"
            placeholder="Write markdown here..."
          />
        ) : (
          <div className="prose prose-invert prose-sm max-w-none p-4">
            {value ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            ) : (
              <p className="text-[#6b7280] italic">Nothing to preview.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
