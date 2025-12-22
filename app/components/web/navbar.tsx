import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="flex w-full items-center justify-between py-5">
      <div className="flex items-center gap-8">
        <Link href="/">
          <h1 className="font-bold text-3xl">
            Next<span className="text-blue-500">Pro</span>
          </h1>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/">Home</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/create">Create</Link>
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
      </div>
    </nav>
  )
}
