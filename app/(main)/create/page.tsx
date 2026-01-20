/** biome-ignore-all lint/correctness/noChildrenProp: for tanstack form */

'use client'

import { Loading03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm } from '@tanstack/react-form'
import { useTransition } from 'react'
import { createBlogAction } from '@/app/action'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { postSchema } from '@/lib/schemas'

export default function CreatePage() {
  const [isPending, startTransition] = useTransition()

  const form = useForm({
    validators: {
      onBlur: postSchema,
    },
    defaultValues: {
      title: '',
      content: '',
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        await createBlogAction(value)
        // client-side mutation with convex
        // await mutation({
        //   body: value.content,
        //   title: value.title,
        // })
        // toast.success('Everything was fine.')
        // router.push('/')
      })
    },
  })
  return (
    <section className="py-12">
      <div className="mb-12 text-center">
        <h1 className="font-extrabold text-4xl tracking-tight sm:text-5xl">
          Create Post
        </h1>
        <p className="pt-4 text-muted-foreground text-xl">
          Share your thoughts with the big world
        </p>
      </div>
      <Card className="mx-auto w-full max-w-xl">
        <CardHeader>
          <CardTitle>Create Blog Article</CardTitle>
          <CardDescription>Create your own blog article...</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="create-form"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <FieldGroup>
              <form.Field
                name="title"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel>Title</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="title"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />
              <form.Field
                name="content"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel>Content</FieldLabel>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Write your blog content here."
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />
              <Button type="submit" form="create-form" disabled={isPending}>
                {isPending ? (
                  <>
                    <HugeiconsIcon
                      icon={Loading03Icon}
                      className="animate-spin"
                    />
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>Create Post</span>
                )}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
