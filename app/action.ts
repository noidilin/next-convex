'use server'

import { redirect } from 'next/navigation'
import type z from 'zod'
import { api } from '@/convex/_generated/api'
import { fetchAuthMutation } from '@/lib/auth-server'
import { postSchema } from '@/lib/schemas'

export async function createBlogAction(value: z.infer<typeof postSchema>) {
  const parsed = postSchema.safeParse(value)
  if (!parsed.success) throw new Error('something went wrong')

  // NOTE: server function won't handle token for you automatically like `useMutation` did
  // const token = await getToken();
  // await fetchMutation(api.posts.createPost, {
  //   body: parsed.data.content,
  //   title: parsed.data.title,
  // }, { token },
  // )

  await fetchAuthMutation(api.posts.createPost, {
    body: parsed.data.content,
    title: parsed.data.title,
  })

  return redirect('/')
}
