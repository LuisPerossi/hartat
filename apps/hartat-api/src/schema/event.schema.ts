import * as z from 'zod'

export type CreateEvent = z.infer<typeof createEventSchema>
export type UpdateEvent = z.infer<typeof updateEventSchema>
export type GetEvents = z.infer<typeof getEventsSchema>
export type EventStatus = z.infer<typeof eventStatusSchema>

export const eventStatusSchema = z.enum(['upcoming', 'ongoing', 'past'])

const dateTimeSchema = z.iso.datetime({ offset: true })

export const createEventSchema = z.object({
    title: z.string().nonempty().max(100),
    description: z.string().nonempty(),
    url: z.url().nullable().optional(),
    dateStart: dateTimeSchema,
    dateEnd: dateTimeSchema,
    imageId: z.number().int().positive().nullable().optional()
})
    .refine(
        data => new Date(data.dateEnd) >= new Date(data.dateStart),
        {
            error: "End date must be greater than or equal to start date",
            path: ["dateEnd"]
        }
    )

export const updateEventSchema = z.object({
    title: z.string().nonempty().max(100).optional(),
    description: z.string().nonempty().optional(),
    url: z.url().nullable().optional(),
    dateStart: dateTimeSchema.optional(),
    dateEnd: dateTimeSchema.optional(),
    imageId: z.number().int().positive().nullable().optional()
})
    .refine(
        data => Object.keys(data).length > 0,
        { error: "Invalid input: expected at least one field, recieved none" }
    )
    .refine(
        data => {
            if (data.dateStart !== undefined && data.dateEnd !== undefined) {
                return new Date(data.dateEnd) >= new Date(data.dateStart)
            }
            return true
        },
        {
            error: "End date must be greater than or equal to start date",
            path: ["dateEnd"]
        }
    )

export const getEventsSchema = z.object({
    search: z.string().optional(),
    status: eventStatusSchema.optional().catch(undefined),
    page: z.coerce.number().int().positive().default(1).catch(1),
    limit: z.coerce.number().int().positive().max(100).default(20).catch(20),
    sort: z.enum(['title', 'dateStart', 'dateEnd']).default('dateStart').catch('dateStart'),
    order: z.enum(['asc', 'desc']).default('asc').catch('asc')
})
