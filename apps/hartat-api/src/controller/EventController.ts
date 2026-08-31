import { EventService } from "../service/EventService";

export class EventController {
    constructor(private readonly service: EventService) {}
}