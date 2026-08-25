import * as z from 'zod'

export const createPostSchema = z.object({
    title: z.string().max(60).nonempty(),
    content: z.string().nonempty()
})