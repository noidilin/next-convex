import type { Metadata } from 'next'
import { ComponentExample } from '@/components/component-example'

export const metadata: Metadata = {
  title: 'Home | Next 16 on board project',
  description:
    'Static landing page showcasing UI components with client-side interactivity via ComponentExample',
  category: 'Static Page + Client Components',
  keywords: ['Next.js 16', 'static page', 'client components', 'UI showcase'],
  authors: [{ name: 'noidilin' }],
}

export default function Page() {
  return <ComponentExample />
}
