import { CreateEvent, EventStatus, EventType, GetEvents, UpdateEvent } from "../schema/event.schema";

export type EventRow = {
    readonly id: number
    readonly title: string
    readonly description: string | null
    readonly type: string | null
    readonly url: string | null
    readonly date_start: string
    readonly date_end: string
    readonly image_id: number | null
    readonly image_key?: string | null
    readonly image_name?: string | null
    readonly image_extension?: string | null
}

export class EventRepository {
    constructor(private readonly db: D1Database) {}

    private buildStatusClause(status?: EventStatus, alias?: string) {
        const prefix = alias ? `${alias}.` : ''

        switch (status) {
            case 'active':
                return `${prefix}date_end >= CURRENT_TIMESTAMP`
            case 'upcoming':
                return `${prefix}date_start > CURRENT_TIMESTAMP`
            case 'ongoing':
                return `${prefix}date_start <= CURRENT_TIMESTAMP AND ${prefix}date_end >= CURRENT_TIMESTAMP`
            case 'past':
                return `${prefix}date_end < CURRENT_TIMESTAMP`
            default:
                return null
        }
    }

    public async create(createEvent: CreateEvent) {
        const result = await this.db
            .prepare(`
                INSERT INTO
                events (title, description, type, url, date_start, date_end, image_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                RETURNING id
            `)
            .bind(
                createEvent.title,
                createEvent.description ?? '',
                createEvent.type ?? 'regular',
                createEvent.url ?? null,
                createEvent.dateStart,
                createEvent.dateEnd,
                createEvent.imageId ?? null
            )
            .first<{ id: number }>()

        if (!result) { throw new Error('Unable to retrieve insert data') }

        const event = await this.getById(result.id)
        if (!event) { throw new Error('Unable to retrieve inserted event') }

        return event
    }

    public async getById(id: number) {
        const result = await this.db
            .prepare(`
                SELECT
                    e.id,
                    e.title,
                    e.description,
                    e.type,
                    e.url,
                    e.date_start,
                    e.date_end,
                    e.image_id,
                    i.key AS image_key,
                    i.name AS image_name,
                    i.extension AS image_extension
                FROM events e
                LEFT JOIN images i ON e.image_id = i.id
                WHERE e.id = ?
            `)
            .bind(id)
            .first<EventRow>()

        return result
    }

    public async getAll(getEvents: GetEvents) {
        const { page, limit, search, type, status, sort, order } = getEvents

        const offset = (page - 1) * limit
        const sortColumn = {
            title: 'e.title',
            dateStart: 'e.date_start',
            dateEnd: 'e.date_end'
        }[sort]

        const whereClauses: string[] = ['e.title LIKE ?']
        const bindings: (string | number)[] = [search ? `%${search}%` : '%']

        if (type !== undefined) {
            whereClauses.push('e.type = ?')
            bindings.push(type)
        }

        const statusClause = this.buildStatusClause(status, 'e')
        if (statusClause) {
            whereClauses.push(statusClause)
        }

        const { results } = await this.db
            .prepare(`
                SELECT
                    e.id,
                    e.title,
                    e.description,
                    e.type,
                    e.url,
                    e.date_start,
                    e.date_end,
                    e.image_id,
                    i.key AS image_key,
                    i.name AS image_name,
                    i.extension AS image_extension
                FROM events e
                LEFT JOIN images i ON e.image_id = i.id
                WHERE ${whereClauses.join(' AND ')}
                ORDER BY ${sortColumn} ${order}
                LIMIT ? OFFSET ?
            `)
            .bind(...bindings, limit, offset)
            .all<EventRow>()

        return results
    }

    public async count(filter: { search?: string, type?: EventType, status?: EventStatus }) {
        const { search, type, status } = filter

        const whereClauses: string[] = ['title LIKE ?']
        const bindings: (string | number)[] = [search ? `%${search}%` : '%']

        if (type !== undefined) {
            whereClauses.push('type = ?')
            bindings.push(type)
        }

        const statusClause = this.buildStatusClause(status)
        if (statusClause) {
            whereClauses.push(statusClause)
        }

        const result = await this.db
            .prepare(`
                SELECT COUNT(*) AS count
                FROM events
                WHERE ${whereClauses.join(' AND ')}
            `)
            .bind(...bindings)
            .first<{ count: number }>()

        return result?.count ?? 0
    }

    public async update(id: number, updateEvent: UpdateEvent) {
        const fields: string[] = []
        const values: unknown[] = []

        if (updateEvent.title !== undefined) {
            fields.push('title = ?')
            values.push(updateEvent.title)
        }

        if (updateEvent.description !== undefined) {
            fields.push('description = ?')
            values.push(updateEvent.description ?? '')
        }

        if (updateEvent.type !== undefined) {
            fields.push('type = ?')
            values.push(updateEvent.type)
        }

        if (updateEvent.url !== undefined) {
            fields.push('url = ?')
            values.push(updateEvent.url)
        }

        if (updateEvent.dateStart !== undefined) {
            fields.push('date_start = ?')
            values.push(updateEvent.dateStart)
        }

        if (updateEvent.dateEnd !== undefined) {
            fields.push('date_end = ?')
            values.push(updateEvent.dateEnd)
        }

        if (updateEvent.imageId !== undefined) {
            fields.push('image_id = ?')
            values.push(updateEvent.imageId)
        }

        values.push(id)

        const result = await this.db
            .prepare(`
                UPDATE events
                SET ${fields.join(', ')}
                WHERE id = ?
                RETURNING id
            `)
            .bind(...values)
            .first<{ id: number }>()

        if (!result) { return null }

        return await this.getById(result.id)
    }

    public async delete(id: number) {
        const result = await this.db
            .prepare(`
                DELETE FROM events
                WHERE id = ?
            `)
            .bind(id)
            .run()

        return result.meta.changes > 0
    }

    public async imageExists(imageId: number) {
        const result = await this.db
            .prepare(`
                SELECT id
                FROM images
                WHERE id = ?
            `)
            .bind(imageId)
            .first<{ id: number }>()

        return result !== null
    }
}
