'use client'

import { useRef } from 'react'
import {
  BoldIcon, ItalicIcon, StrikethroughIcon, Heading1Icon, Heading2Icon,
  ListIcon, ListOrderedIcon, QuoteIcon, CodeIcon, LinkIcon, ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ALLOWED_TYPES_ACCEPT } from '@/lib/upload/upload-image'

function ToolbarButton({ isActive, ...props }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-pressed={isActive}
      className={isActive ? 'bg-muted text-foreground' : undefined}
      {...props}
    />
  )
}

export function EditorToolbar({ editor, onInsertImage }) {
  const fileInputRef = useRef(null)

  if (!editor) return null

  function setLink() {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl ?? '')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-t-lg border border-b-0 border-input bg-muted/30 p-1">
      <ToolbarButton
        isActive={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
        aria-label="Bold"
      >
        <BoldIcon />
      </ToolbarButton>
      <ToolbarButton
        isActive={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        aria-label="Italic"
      >
        <ItalicIcon />
      </ToolbarButton>
      <ToolbarButton
        isActive={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        aria-label="Strikethrough"
      >
        <StrikethroughIcon />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-5" />

      <ToolbarButton
        isActive={editor.isActive('heading', { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        aria-label="Heading 1"
      >
        <Heading1Icon />
      </ToolbarButton>
      <ToolbarButton
        isActive={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        aria-label="Heading 2"
      >
        <Heading2Icon />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-5" />

      <ToolbarButton
        isActive={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        aria-label="Bullet list"
      >
        <ListIcon />
      </ToolbarButton>
      <ToolbarButton
        isActive={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        aria-label="Ordered list"
      >
        <ListOrderedIcon />
      </ToolbarButton>
      <ToolbarButton
        isActive={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        aria-label="Blockquote"
      >
        <QuoteIcon />
      </ToolbarButton>
      <ToolbarButton
        isActive={editor.isActive('codeBlock')}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        aria-label="Code block"
      >
        <CodeIcon />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-5" />

      <ToolbarButton isActive={editor.isActive('link')} onClick={setLink} aria-label="Link">
        <LinkIcon />
      </ToolbarButton>
      <ToolbarButton onClick={() => fileInputRef.current?.click()} aria-label="Insert image">
        <ImageIcon />
      </ToolbarButton>
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES_ACCEPT}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onInsertImage(file)
          event.target.value = ''
        }}
      />
    </div>
  )
}
