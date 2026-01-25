import type { Metadata } from 'next'
import CreateForm from './create-form'

export const metadata: Metadata = {
  title: 'Create Post | Next 16 on board project',
  description:
    'Client-side blog creation form using TanStack Form with onBlur validation, useTransition for pending states, and server actions (createBlogAction) for form submission',
  category: 'Client Component + Server Actions',
  keywords: [
    'Next.js 16',
    'TanStack Form',
    'server actions',
    'useTransition',
    'form validation',
    'file upload',
    'client component',
  ],
  authors: [{ name: 'noidilin' }],
}

export default function CreatePage() {
  return (
    <section className="py-12">
      <div className="mb-12 text-center">
        <h1 className="font-extrabold text-4xl tracking-tight sm:text-5xl">
          Create Post
        </h1>
        <p className="pt-4 text-muted-foreground text-xl">
          Share your thoughts with the big world
        </p>
      </div>
      <CreateForm />
    </section>
  )
}
