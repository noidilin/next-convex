'use client'

import { useConvexAuth } from 'convex/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/base/theme-toggle'
import { Button, buttonVariants } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import SearchInput from './search-input'

export default function Navbar() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const router = useRouter()

  return (
    <nav className="flex w-full items-center justify-between py-5">
      <div className="flex items-center gap-8">
        <Link href="/">
          <h1 className="font-bold text-3xl">
            Next
            <span className="bg-foreground px-0.5 text-accent dark:bg-accent dark:text-accent-foreground">
              Convex
            </span>
          </h1>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/" className={buttonVariants({ variant: 'ghost' })}>
            Home
          </Link>
          <Link href="/blog" className={buttonVariants({ variant: 'ghost' })}>
            Blog
          </Link>
          <Link href="/create" className={buttonVariants({ variant: 'ghost' })}>
            Create
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="mr-2 hidden md:block">
          <SearchInput />
        </div>
        {isLoading ? null : isAuthenticated ? (
          <Button
            onClick={() =>
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    toast.success('Logged out successfully!')
                    router.push('/')
                  },
                  onError: (error) => {
                    toast.error(error.error.message)
                  },
                },
              })
            }
          >
            Logout
          </Button>
        ) : (
          <>
            <Link href="/auth/register" className={buttonVariants()}>
              Sign up
            </Link>
            <Link
              href="/auth/login"
              className={buttonVariants({ variant: 'outline' })}
            >
              Login
            </Link>
          </>
        )}
        <ThemeToggle />
      </div>
    </nav>
  )
}
