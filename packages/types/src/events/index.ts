export * from './api'

export type EventType = 'regular' | 'special'

export type EventStatus = 'active' | 'upcoming' | 'ongoing' | 'past'

export interface EventImage {
    id: number
    key: string
    name: string
    extension: string
}

export interface Event {
    id: number
    title: string
    description: string
    type: EventType
    url: string | null
    dateStart: string
    dateEnd: string
    imageId: number | null
    image?: EventImage | null
}
