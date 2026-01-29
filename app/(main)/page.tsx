import type { Metadata } from 'next'
import Link from 'next/link'
import OnboardTag from '@/components/three/onboard-tag'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { api } from '@/convex/_generated/api'
import { fetchAuthQuery } from '@/lib/auth-server'

export const metadata: Metadata = {
  title: 'Home | Next 16 on board project',
  description:
    'Static landing page showcasing UI components with client-side interactivity via ComponentExample',
  category: 'Static Page + Client Components',
  keywords: ['Next.js 16', 'static page', 'client components', 'UI showcase'],
  authors: [{ name: 'noidilin' }],
}

export default async function Page() {
  const user = await fetchAuthQuery(api.auth.getCurrentUser)
  const displayName = user?.name ?? user?.email ?? 'there'

  return (
    <div className="min-h-screen overflow-hidden">
      <div className="relative mt-16 mb-64 grid items-center gap-10 overflow-hidden rounded-2xl border bg-card/60 lg:mt-20 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="relative overflow-hidden p-8 shadow-sm backdrop-blur-sm sm:p-10">
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2 text-accent">
              <Badge variant="outline">Next.js 16</Badge>
              <Badge variant="outline">Convex</Badge>
              <Badge variant="outline">Better Auth</Badge>
            </div>

            <h1 className="mt-5 font-semibold font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
              {user
                ? `Welcome back, ${displayName}.`
                : 'Welcome to Next Convex.'}
            </h1>

            {user ? (
              <>
                <p className="mt-4 max-w-prose text-lg text-muted-foreground leading-relaxed">
                  You're signed in. Jump back in: write a post, browse the blog,
                  or explore the interactive 3D tag.
                </p>
                {user?.email ? (
                  <p className="mt-3 font-mono text-muted-foreground text-sm">
                    Signed in as {user.email}
                  </p>
                ) : null}
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="/create" className={buttonVariants()}>
                    Create a post
                  </Link>
                  <Link
                    href="/blog"
                    className={buttonVariants({ variant: 'outline' })}
                  >
                    Browse the blog
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="mt-4 max-w-prose text-lg text-muted-foreground leading-relaxed">
                  Sign up to create posts and join live presence, or log in to
                  continue where you left off.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="/auth/register" className={buttonVariants()}>
                    Sign up
                  </Link>
                  <Link
                    href="/auth/login"
                    className={buttonVariants({ variant: 'outline' })}
                  >
                    Log in
                  </Link>
                </div>
              </>
            )}

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border bg-background/60 p-4">
                <p className="font-medium">Fast UX</p>
                <p className="mt-1 text-muted-foreground text-sm">
                  Streaming pages, snappy interactions, and responsive layouts.
                </p>
              </div>
              <div className="rounded-2xl border bg-background/60 p-4">
                <p className="font-medium">Real-time</p>
                <p className="mt-1 text-muted-foreground text-sm">
                  Presence and data updates powered by Convex.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="h-[55vh] sm:h-[60vh] lg:h-[70vh]">
          <OnboardTag />
        </div>
      </div>
    </div>
  )
}
