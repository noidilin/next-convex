import { ConvexError, v } from 'convex/values'
import type { Doc } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import { authComponent } from './auth'

export const createPost = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    imageStorageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx)
    if (!user) throw new ConvexError('Not authenticated')

    const blogArticle = await ctx.db.insert('posts', {
      body: args.body,
      title: args.title,
      authorId: user._id,
      imageStorageId: args.imageStorageId,
    })
    return blogArticle
  },
})

export const generateImageUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx)
    if (!user) throw new ConvexError('Not authenticated')

    return await ctx.storage.generateUploadUrl()
  },
})

export const getPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query('posts').order('desc').collect()

    return await Promise.all(
      posts.map(async (post) => {
        const resolvedImageUrl =
          post.imageStorageId !== undefined
            ? await ctx.storage.getUrl(post.imageStorageId)
            : null
        return { ...post, imageUrl: resolvedImageUrl }
      }),
    )
  },
})

export const getPostById = query({
  args: { postId: v.id('posts') },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId)
    if (!post) return null

    const resolvedImageUrl =
      post?.imageStorageId !== undefined
        ? await ctx.storage.getUrl(post.imageStorageId)
        : null
    return { ...post, imageUrl: resolvedImageUrl }
  },
})

interface ISearchResults {
  _id: string
  title: string
  body: string
}

export const searchPosts = query({
  args: {
    term: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const limit = args.limit
    const results: Array<ISearchResults> = []
    const seen = new Set()

    // NOTE: since we will get result from search 'title' and search 'body'
    // we have to eliminate the duplicated results with set
    const pushDocs = async (docs: Array<Doc<'posts'>>) => {
      for (const doc of docs) {
        if (seen.has(doc._id)) continue

        seen.add(doc._id)
        results.push({
          _id: doc._id,
          title: doc.title,
          body: doc.body,
        })

        if (results.length >= limit) break
      }
    }

    // NOTE: the search results from title is prioritized
    const titleMatches = await ctx.db
      .query('posts')
      .withSearchIndex('search_title', (q) => q.search('title', args.term))
      .take(limit)
    await pushDocs(titleMatches)

    // NOTE: won't even try to search body if results from title exceed the limit
    if (results.length < limit) {
      const bodyMatches = await ctx.db
        .query('posts')
        .withSearchIndex('search_body', (q) => q.search('body', args.term))
        .take(limit)
      await pushDocs(bodyMatches)
    }

    return results
  },
})
