import * as z from "zod"

export type CreateCategory = z.infer<typeof createCategorySchema>
export type UpdateCategory = z.infer<typeof updateCategorySchema>

export const createCategorySchema = z.object({
    name: z.string().nonempty().max(20)
})

export const updateCategorySchema = createCategorySchema
    .partial()
    .refine(
        data => Object.keys(data).length > 0, 
        { error: "Invalid input: expected at least one field, recieved none" }
    )