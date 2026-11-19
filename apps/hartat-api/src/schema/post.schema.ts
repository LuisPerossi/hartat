import * as z from 'zod'

export type CreatePost = z.infer<typeof createPostSchema>
export type UpdatePost = z.infer<typeof updatePostSchema>
export type GetPosts = z.infer<typeof getPostsSchema>

export const createPostSchema = z.object({
    title: z.string().nonempty().max(60),
    content: z.string().nonempty(),
    categoryId: z.number().int().positive().nullable().optional(),
    imageId: z.number().int().positive().nullable().optional()
})

export const updatePostSchema = createPostSchema
    .partial()
    .refine(
        data => Object.keys(data).length > 0, 
        { error: "Invalid input: expected at least one field, recieved none" }
    )

export const getPostsSchema = z.object({
    search: z.string().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().positive().default(1).catch(1),
    limit: z.coerce.number().int().positive().max(100).default(20).catch(20),
    sort: z.enum(['title', 'date']).default('date').catch('date'),
    order: z.enum(['asc', 'desc']).default('desc').catch('desc')
})
