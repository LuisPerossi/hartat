import type { BaseApiResponse, Pagination } from "../shared"
import type { Event } from "./index"

export interface GetEventsResponse extends BaseApiResponse<{
    events: Event[]
    pagination: Pagination
}> {}

export interface GetEventResponse extends BaseApiResponse<{
    event: Event
}> {}

export interface CreateEventResponse extends BaseApiResponse<{
    event: Event
}> {}

export interface UpdateEventResponse extends BaseApiResponse<{
    event: Event
}> {}
