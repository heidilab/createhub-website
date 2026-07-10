"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Minus,
  RemoveFormatting,
  Type,
  Palette,
} from "lucide-react";

const FONT_FAMILIES = [
  { label: "預設", value: "" },
  {
    label: "黑體",
    value: '"PingFang SC", "Microsoft YaHei", "Noto Sans TC", sans-serif',
  },
  {
    label: "明體 / 宋體",
    value: '"Songti TC", "PingFang TC", "SimSun", "Noto Serif TC", serif',
  },
  {
    label: "楷體",
    value: '"Kaiti TC", "Kaiti SC", "STKaiti", "楷体", cursive',
  },
  {
    label: "等寬",
    value: '"SF Mono", "Menlo", "Monaco", "Consolas", monospace',
  },
];

/**
 * We use heading levels for size selection (proper semantic HTML)
 * instead of a fragile custom fontSize extension.
 */
const FONT_SIZES: Array<{
  label: string;
  action: (e: Editor) => void;
  isActive: (e: Editor) => boolean;
}> = [
  {
    label: "細",
    action: (e) => e.chain().focus().setParagraph().run(), // fallback: small handled via style
    isActive: () => false,
  },
  {
    label: "正常",
    action: (e) => e.chain().focus().setParagraph().run(),
    isActive: (e) =>
      e.isActive("paragraph") &&
      !e.isActive("heading") &&
      !e.isActive("bulletList") &&
      !e.isActive("orderedList"),
  },
  {
    label: "大",
    action: (e) =>
      e.chain().focus().toggleHeading({ level: 4 }).run(),
    isActive: (e) => e.isActive("heading", { level: 4 }),
  },
  {
    label: "特大",
    action: (e) =>
      e.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (e) => e.isActive("heading", { level: 3 }),
  },
  {
    label: "標題 1",
    action: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: (e) => e.isActive("heading", { level: 1 }),
  },
  {
    label: "標題 2",
    action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (e) => e.isActive("heading", { level: 2 }),
  },
  {
    label: "標題 3",
    action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (e) => e.isActive("heading", { level: 3 }),
  },
  {
    label: "標題 4",
    action: (e) => e.chain().focus().toggleHeading({ level: 4 }).run(),
    isActive: (e) => e.isActive("heading", { level: 4 }),
  },
  {
    label: "標題 5",
    action: (e) => e.chain().focus().toggleHeading({ level: 5 }).run(),
    isActive: (e) => e.isActive("heading", { level: 5 }),
  },
];

const COLORS = [
  "#000000",
  "#5a7a82",
  "#084e5e",
  "#34ccef",
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#ffffff",
];

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "撳呢度開始輸入…",
  minHeight = "220px",
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5] },
      }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "rte-content focus:outline-none",
        style: `min-height: ${minHeight}`,
      },
    },
    immediatelyRender: false,
  });

  // Sync incoming value once when editor initializes
  useEffect(() => {
    if (editor && value && editor.getHTML() === "<p></p>") {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  return (
    <div className="border border-brand-hair bg-white">
      <Toolbar editor={editor} />
      <div className="p-3 relative">
        {editor ? (
          <EditorContent editor={editor} />
        ) : (
          <div style={{ minHeight }} className="text-brand-softer text-[13px]">
            編輯器載入中…
          </div>
        )}
        {editor?.isEmpty && (
          <div className="pointer-events-none absolute top-3 left-4 text-brand-softer text-[13px]">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Toolbar ──────────────────────────────────────────────────────────
function Toolbar({ editor }: { editor: Editor | null }) {
  const disabled = !editor;
  return (
    <div
      className={`flex flex-wrap items-center gap-1 p-2 border-b border-brand-hair bg-brand-bg/50 ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <FontFamilyPicker editor={editor} />
      <FontSizePicker editor={editor} />
      <Divider />
      <ToolbarBtn
        onClick={() => editor?.chain().focus().toggleBold().run()}
        active={editor?.isActive("bold")}
        title="粗體 (Ctrl+B)"
      >
        <Bold className="w-3.5 h-3.5" />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        active={editor?.isActive("italic")}
        title="斜體 (Ctrl+I)"
      >
        <Italic className="w-3.5 h-3.5" />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
        active={editor?.isActive("underline")}
        title="底線 (Ctrl+U)"
      >
        <UnderlineIcon className="w-3.5 h-3.5" />
      </ToolbarBtn>
      <Divider />
      <ColorPicker editor={editor} />
      <Divider />
      <ToolbarBtn
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
        active={editor?.isActive("bulletList")}
        title="項目列表"
      >
        <List className="w-3.5 h-3.5" />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        active={editor?.isActive("orderedList")}
        title="數字列表"
      >
        <ListOrdered className="w-3.5 h-3.5" />
      </ToolbarBtn>
      <Divider />
      <ToolbarBtn
        onClick={() => editor?.chain().focus().setHorizontalRule().run()}
        title="插入分隔線"
      >
        <Minus className="w-3.5 h-3.5" />
      </ToolbarBtn>
      <Divider />
      <ToolbarBtn
        onClick={() =>
          editor?.chain().focus().unsetAllMarks().clearNodes().run()
        }
        title="清除格式"
      >
        <RemoveFormatting className="w-3.5 h-3.5" />
      </ToolbarBtn>
    </div>
  );
}

function ToolbarBtn({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`p-1.5 rounded transition ${
        active
          ? "bg-brand-dark text-white"
          : "text-brand-muted hover:bg-brand-bg hover:text-brand-dark"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-brand-hair mx-1" />;
}

function FontFamilyPicker({ editor }: { editor: Editor | null }) {
  const current = editor?.getAttributes("textStyle").fontFamily as
    | string
    | undefined;
  const activeLabel =
    FONT_FAMILIES.find((f) => f.value === (current ?? ""))?.label ?? "預設";
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 px-2 py-1.5 text-[12px] text-brand-muted hover:bg-brand-bg hover:text-brand-dark rounded"
        title="字型"
      >
        <Type className="w-3.5 h-3.5" />
        <span className="min-w-[42px] text-left">{activeLabel}</span>
      </button>
      {open && editor && (
        <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-brand-hair shadow-lg min-w-[130px]">
          {FONT_FAMILIES.map((f) => (
            <button
              key={f.label}
              type="button"
              className="w-full text-left px-3 py-2 text-[13px] hover:bg-brand-bg"
              style={{ fontFamily: f.value || undefined }}
              onClick={() => {
                if (f.value) {
                  editor.chain().focus().setFontFamily(f.value).run();
                } else {
                  editor.chain().focus().unsetFontFamily().run();
                }
                setOpen(false);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FontSizePicker({ editor }: { editor: Editor | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 px-2 py-1.5 text-[12px] text-brand-muted hover:bg-brand-bg hover:text-brand-dark rounded"
        title="字體大小"
      >
        <span>Aa</span>
      </button>
      {open && editor && (
        <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-brand-hair shadow-lg min-w-[130px] max-h-[280px] overflow-y-auto">
          {FONT_SIZES.map((s) => (
            <button
              key={s.label}
              type="button"
              className={`w-full text-left px-3 py-2 text-[13px] hover:bg-brand-bg ${
                s.isActive(editor) ? "bg-brand-bg font-semibold" : ""
              }`}
              onClick={() => {
                s.action(editor);
                setOpen(false);
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ColorPicker({ editor }: { editor: Editor | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutside(ref, () => setOpen(false));
  const currentColor =
    (editor?.getAttributes("textStyle").color as string) || "#000000";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 px-2 py-1.5 rounded text-brand-muted hover:bg-brand-bg hover:text-brand-dark"
        title="文字顏色"
      >
        <Palette className="w-3.5 h-3.5" />
        <span
          className="w-3 h-3 border border-brand-hair"
          style={{ backgroundColor: currentColor }}
        />
      </button>
      {open && editor && (
        <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-brand-hair shadow-lg p-2">
          <div className="grid grid-cols-6 gap-1 mb-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`顏色 ${c}`}
                className="w-6 h-6 border border-brand-hair hover:scale-110 transition"
                style={{ backgroundColor: c }}
                onClick={() => {
                  editor.chain().focus().setColor(c).run();
                  setOpen(false);
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-brand-hair pt-2">
            <input
              type="color"
              onChange={(e) =>
                editor.chain().focus().setColor(e.target.value).run()
              }
              className="w-6 h-6 cursor-pointer"
              aria-label="自訂顏色"
            />
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().unsetColor().run();
                setOpen(false);
              }}
              className="text-[11px] text-brand-muted hover:text-brand-dark ml-auto"
            >
              移除顏色
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function useOutside(
  ref: React.RefObject<HTMLElement | null>,
  onClose: () => void
) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

// (Prose styles for both editor + rendered content live in app/globals.css → `.rte-content`)
