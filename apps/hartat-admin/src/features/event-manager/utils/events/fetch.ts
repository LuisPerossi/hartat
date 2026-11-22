import { API_URL } from "@/config/env"
import type { Event, EventStatus, EventType, GetEventResponse, GetEventsResponse } from "@hartat/types/events"

interface FetchEventsProps {
    search?: string
    type?: EventType
    status?: EventStatus
    sort?: 'title' | 'dateStart' | 'dateEnd'
    order?: 'asc' | 'desc'
    page?: number
    limit?: number
}

const DEFAULT_LIMIT = 10

export async function fetchEvents(props: FetchEventsProps = {}) {
    const {
        search = "",
        type,
        status,
        sort = "dateStart",
        order = "asc",
        page = 1,
        limit = DEFAULT_LIMIT
    } = props

    const params = new URLSearchParams()
    if (search.trim()) params.set("search", search.trim())
    if (type) params.set("type", type)
    if (status) params.set("status", status)
    params.set("sort", sort)
    params.set("order", order)
    params.set("page", String(page))
    params.set("limit", String(limit))

    const response = await fetch(`${API_URL}/admin/events?${params.toString()}`)
    const body = await response.json() as GetEventsResponse

    if (!response.ok || !body.data) {
        throw new Error(body.message || "Erro ao carregar eventos")
    }

    return {
        events: body.data.events,
        pagination: body.data.pagination
    }
}

export async function fetchEventById(id: number): Promise<Event> {
    const response = await fetch(`${API_URL}/admin/events/${id}`)
    const body = await response.json() as GetEventResponse

    if (!response.ok || !body.data) {
        throw new Error(body.message || "Erro ao carregar evento")
    }

    return body.data.event
}
