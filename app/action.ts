'use server'

import { redirect } from 'next/navigation'
import type z from 'zod'
import { api } from '@/convex/_generated/api'
import { fetchAuthMutation } from '@/lib/auth-server'
import { postSchema } from '@/lib/schemas'

export async function createBlogAction(value: z.infer<typeof postSchema>) {
  try {
    const parsed = postSchema.safeParse(value)
    if (!parsed.success) throw new Error('something went wrong')

    if (!parsed.data.image) return { error: 'Image is required' }
    // NOTE: server function won't handle token for you automatically like `useMutation` did
    // const token = await getToken();
    // await fetchMutation(api.posts.createPost, {
    //   body: parsed.data.content,
    //   title: parsed.data.title,
    // }, { token },
    // )

    // NOTE: three steps convention for upload image to convex
    // 1. generate image upload url (like endpoint)
    const imageUrl = await fetchAuthMutation(api.posts.generateImageUploadUrl)
    // 2. POST method to that endpoint
    const uploadResult = await fetch(imageUrl, {
      method: 'POST',
      headers: {
        'Content-Type': parsed.data.image.type,
      },
      body: parsed.data.image,
    })
    if (!uploadResult.ok) return { error: 'Failed to upload image' }
    // retrieve the storage ID and store it within the db
    const { storageId } = await uploadResult.json()
    await fetchAuthMutation(api.posts.createPost, {
      body: parsed.data.content,
      title: parsed.data.title,
      imageStorageId: storageId,
    })
  } catch {
    return { error: 'Failed to create post' }
  }

  return redirect('/')
}
