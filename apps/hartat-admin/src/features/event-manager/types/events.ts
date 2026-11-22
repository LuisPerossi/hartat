import type { EventStatus } from "@hartat/types/events"

export interface EventSortOrder {
    sort: 'title' | 'dateStart' | 'dateEnd'
    order: 'asc' | 'desc'
}

export type EventSectionTab = Extract<EventStatus, 'active' | 'past'>
