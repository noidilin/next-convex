import z from 'zod'
import type { Id } from '@/convex/_generated/dataModel'

export const registerSchema = z.object({
  name: z.string().min(3).max(30),
  email: z.email(),
  password: z.string().min(8).max(30),
})

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(30),
})

export const postSchema = z.object({
  title: z.string().min(3).max(50),
  content: z.string().min(10),
  image: z.instanceof(File).nullable(),
})

export const commentSchema = z.object({
  body: z.string().min(10),
  postId: z.custom<Id<'posts'>>(),
})
