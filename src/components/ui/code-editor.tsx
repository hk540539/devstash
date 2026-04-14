"use client";

import { useRef, useState } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Copy, Check } from "lucide-react";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  language = "plaintext",
  readOnly = false,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [height, setHeight] = useState(150);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  function handleCopy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;

    const updateHeight = () => {
      const contentHeight = Math.min(400, Math.max(150, editor.getContentHeight()));
      setHeight(contentHeight);
      editor.layout();
    };

    editor.onDidContentSizeChange(updateHeight);
    updateHeight();
  };

  const displayLang = language && language !== "plaintext" ? language : null;

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      {/* macOS-style header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#2d2d2d] border-b border-[#404040]">
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <div className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>

        {/* Language label */}
        {displayLang && (
          <span className="text-[11px] font-medium text-[#858585] ml-1 capitalize">
            {displayLang}
          </span>
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

      {/* Monaco Editor */}
      <Editor
        height={height}
        language={language || "plaintext"}
        value={value}
        theme="vs-dark"
        onMount={handleMount}
        onChange={(val) => onChange?.(val ?? "")}
        options={{
          readOnly,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 13,
          lineNumbers: readOnly ? "off" : "on",
          folding: false,
          wordWrap: "on",
          padding: { top: 10, bottom: 10 },
          renderLineHighlight: readOnly ? "none" : "line",
          scrollbar: {
            vertical: "auto",
            horizontal: "hidden",
            verticalScrollbarSize: 5,
            useShadows: false,
          },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          contextmenu: !readOnly,
          links: false,
          cursorStyle: readOnly ? "line" : "line",
          renderValidationDecorations: "off",
        }}
      />
    </div>
  );
}
