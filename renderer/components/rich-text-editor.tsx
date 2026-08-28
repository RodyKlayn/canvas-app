import { useCallback, useEffect, type ChangeEvent, type ReactNode } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Link } from "@tiptap/extension-link";
import { Underline } from "@tiptap/extension-underline";
import { TextAlign } from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
} from "lucide-react";
import { Separator, Text } from "@glaze/core/components";
import { useCanvasStore } from "../store";

interface RichTextEditorProps {
  documentId: string;
}

export function RichTextEditor({ documentId }: RichTextEditorProps) {
  const project = useCanvasStore((s) =>
    s.projects.find((p) => p.id === s.activeProjectId),
  );
  const doc = project?.documents?.find((d) => d.id === documentId);
  const updateContent = useCanvasStore((s) => s.updateDocumentContent);
  const renameDoc = useCanvasStore((s) => s.renameDocument);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: "Start writing your report or documentation...",
      }),
    ],
    content: doc?.content ?? "",
    onUpdate: ({ editor: ed }) => {
      updateContent(documentId, ed.getJSON());
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor prose-canvas",
      },
    },
  });

  // Sync content when switching documents — only on documentId change
  useEffect(() => {
    if (editor && doc) {
      editor.commands.setContent(doc.content ?? "");
    }
  }, [documentId]);

  const handleTitleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      renameDoc(documentId, e.target.value || "Untitled Document");
    },
    [documentId, renameDoc],
  );

  if (!editor || !doc) {
    return (
      <div className="h-full flex items-center justify-center">
        <Text color="tertiary">Loading editor...</Text>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Editor toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-separator flex-wrap">
        <input
          value={doc.title}
          onChange={handleTitleChange}
          placeholder="Document title"
          className="bg-transparent text-strong text-primary font-medium focus:outline-none min-w-0 flex-1 mr-2"
        />
        <div className="flex items-center gap-0.5 flex-wrap">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            ariaLabel="Bold"
          >
            <Bold className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            ariaLabel="Italic"
          >
            <Italic className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            ariaLabel="Underline"
          >
            <UnderlineIcon className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            ariaLabel="Strikethrough"
          >
            <Strikethrough className="size-3.5" />
          </ToolbarButton>

          <Separator orientation="vertical" />

          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            active={editor.isActive("heading", { level: 1 })}
            ariaLabel="Heading 1"
          >
            <Heading1 className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={editor.isActive("heading", { level: 2 })}
            ariaLabel="Heading 2"
          >
            <Heading2 className="size-3.5" />
          </ToolbarButton>

          <Separator orientation="vertical" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            ariaLabel="Bullet list"
          >
            <List className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            ariaLabel="Ordered list"
          >
            <ListOrdered className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            ariaLabel="Quote"
          >
            <Quote className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
            ariaLabel="Code block"
          >
            <Code className="size-3.5" />
          </ToolbarButton>

          <Separator orientation="vertical" />

          <ToolbarButton
            onClick={() => {
              const url = window.prompt("Enter URL:");
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }}
            active={editor.isActive("link")}
            ariaLabel="Add link"
          >
            <Link2 className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
            ariaLabel="Insert table"
          >
            <TableIcon className="size-3.5" />
          </ToolbarButton>

          <Separator orientation="vertical" />

          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
            ariaLabel="Align left"
          >
            <AlignLeft className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
            ariaLabel="Align center"
          >
            <AlignCenter className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })}
            ariaLabel="Align right"
          >
            <AlignRight className="size-3.5" />
          </ToolbarButton>

          <Separator orientation="vertical" />

          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            ariaLabel="Undo"
          >
            <Undo className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            ariaLabel="Redo"
          >
            <Redo className="size-3.5" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-8 py-6">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  active,
  disabled,
  ariaLabel,
}: {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  ariaLabel: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`p-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        active
          ? "bg-accent text-white"
          : "text-secondary hover:bg-list-hover hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}
