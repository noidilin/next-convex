import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import Link from 'next/link'
import CommentSection from '@/components/complex/comment-section'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { fetchAuthQuery } from '@/lib/auth-server'

interface PostIdRouteProps {
  params: Promise<{
    // to satisfy the v.id('posts') args in posts.ts
    postId: Id<'posts'>
  }>
}

export default async function PostIdRoute({ params }: PostIdRouteProps) {
  const { postId } = await params
  const post = await fetchAuthQuery(api.posts.getPostById, { postId: postId })
  if (!post)
    return (
      <h1 className="py-20 font-extrabold text-6xl text-muted-foreground">
        No Post Found
      </h1>
    )

  return (
    <div className="fade-in relative mx-auto max-w-3xl animate-in px-4 py-8 duration-500">
      <Link
        href="/blog"
        className={buttonVariants({ variant: 'outline', className: 'mb-4' })}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
        <span>Back to blog</span>
      </Link>
      <div className="relative mb-8 h-100 w-full overflow-hidden rounded-xl shadow-sm">
        <Image
          src={
            post.imageUrl ??
            'https://images.unsplash.com/photo-1761019646782-4bc46ba43fe9?q=80&w=1631&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
          }
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
      <div className="flex flex-col space-y-4">
        <h1 className="font-bold text-4xl text-foreground tracking-tight">
          {post.title}
        </h1>
        <p className="text-shadow-muted-foreground text-sm">
          Posted on: {new Date(post._creationTime).toLocaleDateString()}
        </p>
      </div>
      <Separator className="my-8" />
      <p className="whitespace-pre-wrap text-foreground/90 text-lg leading-relaxed">
        {post.body}
      </p>
      <Separator className="my-8" />
      <CommentSection />
    </div>
  )
}
