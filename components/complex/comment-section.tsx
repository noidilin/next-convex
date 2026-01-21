/** biome-ignore-all lint/correctness/noChildrenProp: for tanstack form */

'use client'

import { Loading03Icon, Message01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm } from '@tanstack/react-form'
import { useMutation } from 'convex/react'
import { useParams } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { commentSchema } from '@/lib/schemas'
import { Button } from '../ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import { Field, FieldGroup, FieldLabel } from '../ui/field'
import { Textarea } from '../ui/textarea'

export default function CommentSection() {
  const [isPending, startTransition] = useTransition()
  const params = useParams<{ postId: Id<'posts'> }>()
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 border-b">
        <HugeiconsIcon icon={Message01Icon} className="size-5" />
        <h2 className="font-bold text-xl">Comments</h2>
      </CardHeader>
      <CardContent>
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
        </form>
      </CardContent>
      <CardFooter>
        <Field>
          <Button type="submit" form="comment-form" disabled={isPending}>
            {isPending ? (
              <>
                <HugeiconsIcon icon={Loading03Icon} className="animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <span>Comment</span>
            )}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
