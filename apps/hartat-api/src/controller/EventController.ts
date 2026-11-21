import { Context } from "hono";
import { EventService } from "../service/EventService";
import { idParser } from "../helper/idParser";
import { jsonParser } from "../helper/jsonParser";
import { validate } from "../helper/validate";
import { createEventSchema, getEventsSchema, updateEventSchema } from "../schema/event.schema";

export class EventController {
    constructor(private readonly service: EventService) {}

    public async create(c: Context) {
        const body = await jsonParser(c.req)

        const createEvent = validate(createEventSchema, body)

        const event = await this.service.create(createEvent)

        return c.json({ message: 'Created event', data: { event } }, 201)
    }

    public async getById(c: Context) {
        const id = idParser(c.req)

        const event = await this.service.getById(id)

        return c.json({ message: 'Retrieved event', data: { event } }, 200)
    }

    public async getAll(c: Context) {
        const query = c.req.query()

        const getEvents = validate(getEventsSchema, query)

        const { events, pagination } = await this.service.getAll(getEvents)

        return c.json({ message: 'Retrieved events', data: { events, pagination } }, 200)
    }

    public async update(c: Context) {
        const id = idParser(c.req)
        const body = await jsonParser(c.req)

        const updateEvent = validate(updateEventSchema, body)

        const event = await this.service.update(id, updateEvent)

        return c.json({ message: 'Updated event', data: { event } }, 200)
    }

    public async delete(c: Context) {
        const id = idParser(c.req)

        await this.service.delete(id)

        return c.json({ message: 'Deleted event' }, 200)
    }
}
