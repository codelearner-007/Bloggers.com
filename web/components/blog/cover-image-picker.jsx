'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ImageIcon, Loader2Icon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadImage } from '@/lib/upload/upload-image'
import { toast } from 'sonner'

const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif',
])
const MAX_BYTES = 5 * 1024 * 1024

export function CoverImagePicker({ value, publicUrl, onChange }) {
  const inputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  async function handleFile(file) {
    if (!file) return

    if (!ALLOWED_TYPES.has(file.type)) {
      toast.error('Only JPEG, PNG, WebP, AVIF and GIF images are supported.')
      return
    }
    if (file.size > MAX_BYTES) {
      toast.error('Images must be 5 MB or smaller.')
      return
    }

    setIsUploading(true)
    try {
      const { attachmentId, publicUrl: uploadedUrl } = await uploadImage(file, { kind: 'cover' })
      onChange(attachmentId, uploadedUrl)
    } catch (error) {
      toast.error(error.message ?? 'Cover upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  function handleDrop(event) {
    event.preventDefault()
    setIsDraggingOver(false)
    handleFile(event.dataTransfer.files?.[0])
  }

  if (publicUrl) {
    return (
      <div className="relative w-full max-w-sm overflow-hidden rounded-lg border border-border">
        <Image
          src={publicUrl}
          alt="Cover"
          width={640}
          height={360}
          className="aspect-video w-full object-cover"
        />
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          className="absolute top-2 right-2"
          onClick={() => onChange(null, null)}
          aria-label="Remove cover image"
        >
          <XIcon />
        </Button>
      </div>
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !isUploading && inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click()
      }}
      onDragOver={(event) => {
        event.preventDefault()
        setIsDraggingOver(true)
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={handleDrop}
      className={`flex w-full max-w-sm aspect-video cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground transition-colors ${
        isDraggingOver ? 'border-ring bg-muted' : 'border-input hover:bg-muted'
      }`}
    >
      {isUploading ? (
        <Loader2Icon className="size-5 animate-spin" />
      ) : (
        <ImageIcon className="size-5" />
      )}
      <span>{isUploading ? 'Uploading…' : 'Click or drop a cover image'}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        className="hidden"
        disabled={isUploading}
        onChange={(event) => {
          handleFile(event.target.files?.[0])
          event.target.value = ''
        }}
      />
    </div>
  )
}
