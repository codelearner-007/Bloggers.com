'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { submitContactMessage } from '@/app/contact/actions'

const EMPTY_FORM = { name: '', email: '', message: '' }

export function ContactForm() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await submitContactMessage(form)
      toast.success("Message sent -- we'll get back to you soon.")
      setForm(EMPTY_FORM)
    } catch (error) {
      toast.error(error.message || 'Failed to send your message')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium text-foreground">Name</label>
        <Input id="name" required value={form.name} onChange={handleChange('name')} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
        <Input id="email" type="email" required value={form.email} onChange={handleChange('email')} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="message" className="text-sm font-medium text-foreground">Message</label>
        <Textarea
          id="message"
          required
          rows={6}
          value={form.message}
          onChange={handleChange('message')}
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  )
}
