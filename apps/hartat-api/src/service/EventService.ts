import { EventRepository } from "../repository/EventRepository";

export class EventService {
    constructor(private readonly repository: EventRepository) {}
}