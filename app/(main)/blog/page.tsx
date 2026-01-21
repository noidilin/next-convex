import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/convex/_generated/api'
import { fetchAuthQuery } from '@/lib/auth-server'

export default function BlogPage() {
  return (
    <div className="py-12">
      <div className="pb-12 text-center">
        <h1 className="font-extrabold text-4xl tracking-tight sm:text-5xl">
          Our Blog
        </h1>
        <p className="mx-auto max-w-2xl pt-4 text-muted-foreground text-xl">
          Insights, thoughts, and trends from our team.
        </p>
      </div>
      <Suspense fallback={<SkeletonLoadingUI />}>
        <LoadingBlogList />
      </Suspense>
    </div>
  )
}

async function LoadingBlogList() {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  // NOTE: if we fetch at the server side, we lost the ability to subscribe to convex database like useQuery does
  // const data = useQuery(api.posts.getPosts)
  const data = await fetchAuthQuery(api.posts.getPosts)

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {data?.map((post) => (
        <Card key={post._id} className="pt-0">
          <CardHeader className="relative h-48 w-full overflow-hidden">
            <Image
              src={
                post.imageUrl ??
                'https://images.unsplash.com/photo-1761019646782-4bc46ba43fe9?q=80&w=1631&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
              }
              alt="image"
              className="rounded-t-lg object-cover"
              fill
            />
          </CardHeader>
          <CardContent>
            <Link href={`/blog/${post._id}`}>
              <h1 className="font-bold text-2xl hover:text-primary">
                {post.title}
              </h1>
            </Link>
            <p className="line-clamp-3 text-muted-foreground">{post.body}</p>
          </CardContent>
          <CardFooter>
            <Link
              href={`/blog/${post._id}`}
              className={buttonVariants({ className: 'w-full' })}
            >
              Read more
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function SkeletonLoadingUI() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton array
        <div key={i} className="flex flex-col space-y-3">
          <Skeleton className="h-48 w-full rounded-xl" />
          <div className="flex flex-col space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
