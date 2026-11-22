import { BadRequestError } from "../error/BadRequestError";
import { NotFoundError } from "../error/NotFoundError";
import { Event } from "../model/Event";
import { EventRepository } from "../repository/EventRepository";
import { CreateEvent, GetEvents, UpdateEvent } from "../schema/event.schema";

function toSqliteDateTime(date: string): string {
    return new Date(date).toISOString().slice(0, 19).replace('T', ' ')
}

function parseDatabaseDate(date: string): Date {
    if (date.includes('T') || date.endsWith('Z')) {
        return new Date(date)
    }
    return new Date(date.replace(' ', 'T') + 'Z')
}

export class EventService {
    constructor(private readonly repository: EventRepository) {}

    public async create(createEvent: CreateEvent) {
        if (createEvent.imageId) {
            const exists = await this.repository.imageExists(createEvent.imageId)
            if (!exists) {
                throw new NotFoundError('Image not found')
            }
        }

        const data = await this.repository.create({
            ...createEvent,
            dateStart: toSqliteDateTime(createEvent.dateStart),
            dateEnd: toSqliteDateTime(createEvent.dateEnd)
        })

        return Event.fromDatabase(data)
    }

    public async getById(id: number) {
        const data = await this.repository.getById(id)

        if (!data) { throw new NotFoundError('Event not found') }

        return Event.fromDatabase(data)
    }

    public async getAll(getEvents: GetEvents) {
        const data = await this.repository.getAll(getEvents)
        const count = await this.repository.count({
            search: getEvents.search,
            type: getEvents.type,
            status: getEvents.status
        })

        const { page, limit } = getEvents
        const events = data.map(Event.fromDatabase)

        const pagination = {
            currentPage: page,
            perPage: limit,
            totalPages: Math.ceil(count / limit),
            totalRecords: count
        }

        return { events, pagination }
    }

    public async update(id: number, updateEvent: UpdateEvent) {
        const existing = await this.repository.getById(id)
        if (!existing) {
            throw new NotFoundError('Event not found')
        }

        if (updateEvent.imageId) {
            const exists = await this.repository.imageExists(updateEvent.imageId)
            if (!exists) {
                throw new NotFoundError('Image not found')
            }
        }

        const effectiveStart = updateEvent.dateStart !== undefined
            ? new Date(updateEvent.dateStart)
            : parseDatabaseDate(existing.date_start)

        const effectiveEnd = updateEvent.dateEnd !== undefined
            ? new Date(updateEvent.dateEnd)
            : parseDatabaseDate(existing.date_end)

        if (effectiveEnd < effectiveStart) {
            throw new BadRequestError('End date must be greater than or equal to start date')
        }

        const normalizedUpdate: UpdateEvent = {
            ...updateEvent,
            ...(updateEvent.dateStart !== undefined ? { dateStart: toSqliteDateTime(updateEvent.dateStart) } : {}),
            ...(updateEvent.dateEnd !== undefined ? { dateEnd: toSqliteDateTime(updateEvent.dateEnd) } : {})
        }

        const data = await this.repository.update(id, normalizedUpdate)

        if (!data) { throw new NotFoundError('Event not found') }

        return Event.fromDatabase(data)
    }

    public async delete(id: number) {
        const deleted = await this.repository.delete(id)

        if (!deleted) { throw new NotFoundError('Event not found') }
    }
}
