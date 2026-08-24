'use client'

import { useState } from 'react'
import { useRouter, unstable_rethrow } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapImage from '@tiptap/extension-image'
import TiptapLink from '@tiptap/extension-link'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { EditorToolbar } from '@/components/blog/editor-toolbar'
import { CoverImagePicker } from '@/components/blog/cover-image-picker'
import { saveBlog } from '@/app/(app)/editor/actions'
import { uploadImage } from '@/lib/upload/upload-image'

export function BlogEditor({ initialBlog }) {
  const router = useRouter()

  const [blogId, setBlogId] = useState(initialBlog?.id ?? null)
  const [title, setTitle] = useState(initialBlog?.title ?? '')
  const [excerpt, setExcerpt] = useState(initialBlog?.excerpt ?? '')
  const [coverAttachmentId, setCoverAttachmentId] = useState(initialBlog?.cover_attachment_id ?? null)
  const [coverUrl, setCoverUrl] = useState(initialBlog?.cover_url ?? null)
  const [status, setStatus] = useState(initialBlog?.status ?? 'draft')
  const [savingStatus, setSavingStatus] = useState(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TiptapImage,
      TiptapLink.configure({ openOnClick: false }),
    ],
    content: initialBlog?.content_json ?? initialBlog?.content_html ?? '',
    editorProps: {
      attributes: {
        class: 'prose prose-neutral dark:prose-invert min-h-64 max-w-none px-3 py-2 focus:outline-none',
      },
      handleDrop: (view, event) => {
        const file = event.dataTransfer?.files?.[0]
        if (!file || !file.type.startsWith('image/')) return false
        event.preventDefault()
        insertImage(file)
        return true
      },
      handlePaste: (view, event) => {
        const file = Array.from(event.clipboardData?.files ?? []).find((item) =>
          item.type.startsWith('image/')
        )
        if (!file) return false
        event.preventDefault()
        insertImage(file)
        return true
      },
    },
  })

  // Shared by the toolbar's image button, drag-and-drop, and paste, so an
  // inline image always goes through the same upload-then-insert path.
  async function insertImage(file) {
    const uploadingToast = toast.loading('Uploading image…')
    try {
      const { publicUrl } = await uploadImage(file, { kind: 'inline' })
      editor?.chain().focus().setImage({ src: publicUrl, alt: file.name }).run()
      toast.success('Image inserted.', { id: uploadingToast })
    } catch (error) {
      toast.error(error.message ?? 'Image upload failed.', { id: uploadingToast })
    }
  }

  async function handleSave(nextStatus) {
    if (!title.trim()) {
      toast.error('Title is required.')
      return
    }

    setSavingStatus(nextStatus)
    try {
      const payload = {
        id: blogId,
        title,
        excerpt,
        content_html: editor?.getHTML() ?? '',
        content_json: editor?.getJSON() ?? null,
        cover_attachment_id: coverAttachmentId,
        status: nextStatus,
      }
      const saved = await saveBlog(payload)

      setStatus(nextStatus)
      toast.success(nextStatus === 'published' ? 'Blog published.' : 'Draft saved.')

      if (saved?.id && saved.id !== blogId) {
        setBlogId(saved.id)
        router.replace(`/editor/${saved.id}`)
      }
    } catch (error) {
      unstable_rethrow(error)
      toast.error(error.message ?? 'Could not save the blog. Please try again.')
    } finally {
      setSavingStatus(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="blog-title">Title</Label>
        <Input
          id="blog-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Give your blog a title"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="blog-excerpt">Excerpt</Label>
        <Textarea
          id="blog-excerpt"
          value={excerpt}
          onChange={(event) => setExcerpt(event.target.value)}
          placeholder="A short summary shown in blog listings"
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Cover image</Label>
        <CoverImagePicker
          value={coverAttachmentId}
          publicUrl={coverUrl}
          onChange={(attachmentId, publicUrl) => {
            setCoverAttachmentId(attachmentId)
            setCoverUrl(publicUrl)
          }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Content</Label>
        <div className="rounded-lg">
          <EditorToolbar editor={editor} onInsertImage={insertImage} />
          <div className="rounded-b-lg border border-input">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="blog-status">Status</Label>
          <Select value={status} onValueChange={setStatus} disabled={savingStatus !== null}>
            <SelectTrigger id="blog-status" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={savingStatus !== null}
            onClick={() => handleSave('draft')}
          >
            {savingStatus === 'draft' ? 'Saving…' : 'Save draft'}
          </Button>
          <Button
            type="button"
            disabled={savingStatus !== null}
            onClick={() => handleSave(status)}
          >
            {savingStatus === status ? (status === 'published' ? 'Publishing…' : 'Saving…') : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}
