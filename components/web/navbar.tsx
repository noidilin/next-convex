import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { ThemeToggle } from '../theme-toggle'

export default function Navbar() {
  return (
    <nav className="flex w-full items-center justify-between py-5">
      <div className="flex items-center gap-8">
        <Link href="/">
          <h1 className="font-bold text-3xl">
            Next
            <span className="bg-foreground px-0.5 text-accent dark:bg-accent dark:text-accent-foreground">
              Pro
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
        <Link href="/auth/sign-up" className={buttonVariants()}>
          Sign up
        </Link>
        <Link
          href="/auth/login"
          className={buttonVariants({ variant: 'outline' })}
        >
          Login
        </Link>
        <ThemeToggle />
      </div>
    </nav>
  )
}
