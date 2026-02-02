import type { Metadata } from 'next'
import Link from 'next/link'
import { cache, Suspense } from 'react'
import OnboardTag from '@/components/three/onboard-tag'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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

// PERF: The render and data flow in route `/`
// 1. Page component runs on the server: it calls `getCurrentUser()` → returns `userPromise`
//    - since `getCurrentUser` is wrapped in React `cache()`
//    - any other call to `getCurrentUser()` during this same request returns the same promise/result
// 2. Page component renders
//    - not `await` here, so the whote route from streaming won't be block
//    - fallback component in `<Suspense>` got render first
// 3. HomeHero component renders
//    - it is component that actually accepts promise with the `await` keyboard
//    - Next replace the fallback component with this component when promise resolves
// 4. The child component in HomeHero
//    - `<WelcomeTitle user={user} />` (server component)
//    - `<OnboardTag user={user} />` (client component - need interactivity)
// 5. When props is passed to a Client Component
//    - Next must serialize the props over the RSC boundary
//    - only JSON-serializable data can be passed (strings, numbers, booleans, null, plain objects/arrays)
// 6. OnboardTag runs in the browser
//    - It receives user as a plain prop, and passes it down to BadgeTexture
//    - BadgeTexture then decides what to display based on user's presence

// NOTE: The cache() in React is a request-scoped memoization, which prevents duplicate calls within the same request
const getCurrentUser = cache(() => fetchAuthQuery(api.auth.getCurrentUser))

type CurrentUser = Awaited<ReturnType<typeof getCurrentUser>>

export default function Page() {
  const userPromise = getCurrentUser()

  return (
    <div className="min-h-screen overflow-hidden">
      <Suspense fallback={<HomeHeroSkeleton />}>
        <HomeHero userPromise={userPromise} />
      </Suspense>
    </div>
  )
}

async function HomeHero({
  userPromise,
}: {
  userPromise: ReturnType<typeof getCurrentUser>
}) {
  const user = await userPromise

  return (
    <div className="relative mt-16 mb-64 grid items-center gap-10 overflow-hidden rounded-2xl border bg-card/60 lg:mt-20 lg:grid-cols-[1.15fr_0.85fr]">
      <WelcomeTitle user={user} />
      <div className="h-[55vh] sm:h-[60vh] lg:h-[70vh]">
        <OnboardTag user={user} />
      </div>
    </div>
  )
}

function WelcomeTitle({ user }: { user: CurrentUser }) {
  const displayName = user?.name ?? user?.email ?? 'there'

  return (
    <section className="relative overflow-hidden p-8 sm:p-10">
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2 text-accent">
          <Badge variant="outline">Next.js 16</Badge>
          <Badge variant="outline">Convex</Badge>
          <Badge variant="outline">Better Auth</Badge>
        </div>

        <h1 className="mt-5 font-semibold font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
          {user ? (
            <span>
              Welcome back <br /> {displayName}.
            </span>
          ) : (
            <span>Welcome to Next Convex.</span>
          )}
        </h1>

        {user ? (
          <>
            <p className="mt-4 max-w-prose text-lg text-muted-foreground leading-relaxed">
              You're signed in. Jump back in: write a post, browse the blog, or
              explore the interactive 3D tag.
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
  )
}

function HomeHeroSkeleton() {
  return (
    <div className="relative mt-16 mb-64 grid items-center gap-10 overflow-hidden rounded-2xl border bg-card/60 lg:mt-20 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="relative overflow-hidden p-8 sm:p-10">
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          <div className="mt-5 space-y-3">
            <Skeleton className="h-10 w-4/5 sm:h-12" />
            <Skeleton className="h-10 w-2/3 sm:h-12" />
          </div>

          <div className="mt-5 space-y-2">
            <Skeleton className="h-5 w-full max-w-prose" />
            <Skeleton className="h-5 w-5/6 max-w-prose" />
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-36" />
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border bg-background/60 p-4">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-5/6" />
            </div>
            <div className="rounded-2xl border bg-background/60 p-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-4/5" />
            </div>
          </div>
        </div>
      </section>
      <div className="h-[55vh] sm:h-[60vh] lg:h-[70vh]">
        <div className="flex h-full w-full items-center justify-center">
          <Skeleton className="h-[75%] w-[75%] rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
