import { API_URL } from "@/config/env"
import type { Event, EventType, UpdateEventResponse } from "@hartat/types/events"

interface UpdateEventParams {
    title?: string
    description?: string
    type?: EventType
    url?: string | null
    dateStart?: string
    dateEnd?: string
    imageId?: number | null
}

export async function updateEvent(id: number, params: UpdateEventParams): Promise<Event> {
    const payload: Record<string, unknown> = {}
    if (params.title !== undefined) payload.title = params.title
    if (params.description !== undefined) payload.description = params.description
    if (params.type !== undefined) payload.type = params.type
    if (params.url !== undefined) payload.url = params.url
    if (params.dateStart !== undefined) payload.dateStart = params.dateStart
    if (params.dateEnd !== undefined) payload.dateEnd = params.dateEnd
    if (params.imageId !== undefined) payload.imageId = params.imageId

    const response = await fetch(`${API_URL}/admin/events/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })

    const body = await response.json() as UpdateEventResponse

    if (!response.ok || !body.data) {
        throw new Error(body.message || "Erro ao atualizar evento")
    }

    return body.data.event
}
