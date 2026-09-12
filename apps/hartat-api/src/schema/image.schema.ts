import * as z from 'zod'

export type CreateImage = {
    key: string,
    name: string,
}

export type UpdateImage = z.infer<typeof updateImageSchema>
export type GetImages = z.infer<typeof getImagesSchema>

export const updateImageSchema = z.object({ name: z.string().nonempty() })
    .partial()
    .refine(
        data => Object.keys(data).length > 0, 
        { error: "Invalid input: expected at least one field, recieved none" }
    )

export const getImagesSchema = z.object({
    search: z.string().optional(),
    page: z.coerce.number().int().positive().default(1).catch(1),
    limit: z.coerce.number().int().positive().max(100).default(20).catch(20),
    sort: z.enum(['name', 'date']).default('date').catch('date'),
    order: z.enum(['asc', 'desc']).default('desc').catch('desc')
})