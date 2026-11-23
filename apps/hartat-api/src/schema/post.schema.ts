import * as z from 'zod'

export type CreatePost = z.infer<typeof createPostSchema>
export type UpdatePost = z.infer<typeof updatePostSchema>
export type GetPosts = z.infer<typeof getPostsSchema>

export const slugSchema = z
    .string()
    .trim()
    .min(1, 'O slug não pode ser vazio')
    .max(100, 'O slug deve ter no máximo 100 caracteres')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'O slug deve conter apenas letras minúsculas, números e hífens')

export const bannerAlignmentSchema = z.enum(['top', 'center', 'bottom'])

export const createPostSchema = z.object({
    title: z.string().nonempty().max(60),
    slug: slugSchema.optional(),
    content: z.string().nonempty(),
    bannerAlignment: bannerAlignmentSchema.optional().default('center'),
    isHighlighted: z.boolean().optional().default(false),
    categoryId: z.number().int().positive().nullable().optional(),
    imageId: z.number().int().positive().nullable().optional()
})

export const updatePostSchema = z.object({
    title: z.string().nonempty().max(60).optional(),
    slug: slugSchema.optional(),
    content: z.string().nonempty().optional(),
    bannerAlignment: bannerAlignmentSchema.optional(),
    isHighlighted: z.boolean().optional(),
    categoryId: z.number().int().positive().nullable().optional(),
    imageId: z.number().int().positive().nullable().optional()
})
    .refine(
        data => Object.keys(data).length > 0, 
        { error: "Invalid input: expected at least one field, recieved none" }
    )

export const getPostsSchema = z.object({
    search: z.string().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    isHighlighted: z.preprocess(
        val => val === 'true' || val === true ? true : val === 'false' || val === false ? false : undefined,
        z.boolean().optional()
    ),
    page: z.coerce.number().int().positive().default(1).catch(1),
    limit: z.coerce.number().int().positive().max(100).default(20).catch(20),
    sort: z.enum(['title', 'date', 'updated']).default('date').catch('date'),
    order: z.enum(['asc', 'desc']).default('desc').catch('desc')
})
