import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { buttonVariants } from '@/components/ui/button'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="absolute top-5 left-5">
        <Link href="/" className={buttonVariants({ variant: 'secondary' })}>
          <HugeiconsIcon icon={ArrowLeft01Icon} />
          Go Back
        </Link>
      </div>
      <div className="mx-auto w-full max-w-md">{children}</div>
    </div>
  )
}
