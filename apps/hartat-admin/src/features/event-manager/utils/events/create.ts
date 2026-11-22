import { API_URL } from "@/config/env"
import type { CreateEventResponse, Event, EventType } from "@hartat/types/events"

interface CreateEventParams {
    title: string
    description?: string
    type?: EventType
    url?: string | null
    dateStart: string
    dateEnd: string
    imageId?: number | null
}

export async function createEvent(params: CreateEventParams): Promise<Event> {
    const response = await fetch(`${API_URL}/admin/events`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: params.title,
            description: params.description ?? "",
            type: params.type ?? "regular",
            url: params.url ?? null,
            dateStart: params.dateStart,
            dateEnd: params.dateEnd,
            imageId: params.imageId ?? null
        })
    })

    const body = await response.json() as CreateEventResponse

    if (!response.ok || !body.data) {
        throw new Error(body.message || "Erro ao criar evento")
    }

    return body.data.event
}
