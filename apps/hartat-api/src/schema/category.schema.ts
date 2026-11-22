import * as z from "zod"

export type CreateCategory = z.infer<typeof createCategorySchema>
export type UpdateCategory = z.infer<typeof updateCategorySchema>

export const createCategorySchema = z.object({
    name: z.string().nonempty().max(20),
    color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, { error: "Formato de cor inválido (esperado hex ex: #3B82F6)" }).optional()
})

export const updateCategorySchema = createCategorySchema
    .partial()
    .refine(
        data => Object.keys(data).length > 0, 
        { error: "Invalid input: expected at least one field, recieved none" }
    )
