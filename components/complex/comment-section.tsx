/** biome-ignore-all lint/correctness/noChildrenProp: for tanstack form */

'use client'

import { Loading03Icon, Message01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery } from 'convex/react'
import { useParams } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { commentSchema } from '@/lib/schemas'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import { Field, FieldGroup, FieldLabel } from '../ui/field'
import { Separator } from '../ui/separator'
import { Textarea } from '../ui/textarea'

export default function CommentSection() {
  const [isPending, startTransition] = useTransition()
  const params = useParams<{ postId: Id<'posts'> }>()
  const data = useQuery(api.comments.getCommentsByPostId, {
    postId: params.postId,
  })
  const mutation = useMutation(api.comments.createComment)

  const form = useForm({
    validators: { onBlur: commentSchema },
    defaultValues: {
      body: '',
      postId: params.postId,
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        try {
          await mutation(value)
          form.reset()
          toast.success('Comment Posted')
        } catch {
          toast.error('Failed to create post')
        }
      })
    },
  })

  if (data === undefined) return <p>loading...</p>

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 border-b">
        <HugeiconsIcon icon={Message01Icon} className="size-5" />
        <h2 className="font-bold text-xl">{data.length} Comments</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          id="comment-form"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="body"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field>
                    <FieldLabel>Comment Here</FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="share your thoughs"
                    />
                  </Field>
                )
              }}
            />
          </FieldGroup>
          <Button
            className="mt-2"
            type="submit"
            form="comment-form"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <HugeiconsIcon icon={Loading03Icon} className="animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <span>Comment</span>
            )}
          </Button>
        </form>

        {data.length > 0 && <Separator />}

        <section className="space-y-6">
          {data?.map((comment) => (
            <div key={comment._id} className="flex gap-4">
              <Avatar className="size-10 shrink-0">
                <AvatarImage
                  src={`https://avatar.vercel.sh/${comment.authorName}`}
                  alt={comment.authorName}
                />
                <AvatarFallback>
                  {comment.authorName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">{comment.authorName}</p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(comment._creationTime).toLocaleDateString()}
                  </p>
                </div>
                <p className="whitespace-pre-wrap text-foreground/90 text-sm leading-relaxed">
                  {comment.body}
                </p>
              </div>
            </div>
          ))}
        </section>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  )
}
