import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ContactForm } from '@/components/contact/contact-form'

export const metadata = {
  title: 'Contact',
  description: 'Get in touch with the Bloggers.com team.',
}

export default function ContactPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-2xl">Contact us</CardTitle>
          <CardDescription>Questions, feedback, or something else on your mind -- let us know.</CardDescription>
        </CardHeader>
        <CardContent>
          <ContactForm />
        </CardContent>
      </Card>
    </main>
  )
}
