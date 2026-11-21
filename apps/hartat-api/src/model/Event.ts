import { EventRow } from "../repository/EventRepository"

export type EventImage = {
    id: number
    key: string
    name: string
    extension: string
}

export class Event {
    constructor(
        public readonly id: number,
        public title: string,
        public description: string,
        public url: string | null,
        private readonly dateStart: string,
        private readonly dateEnd: string,
        public readonly imageId: number | null,
        public readonly image?: EventImage | null
    ) {}

    private convertDate(date: string) {
        if (date.includes('T') || date.endsWith('Z')) {
            return new Date(date)
        }
        return new Date(date.replace(' ', 'T') + 'Z')
    }

    public static fromDatabase(data: EventRow) {
        const image = data.image_id && data.image_key ? {
            id: data.image_id,
            key: data.image_key,
            name: data.image_name ?? '',
            extension: data.image_extension ?? ''
        } : null

        return new Event(
            data.id,
            data.title,
            data.description,
            data.url ?? null,
            data.date_start,
            data.date_end,
            data.image_id ?? null,
            image
        )
    }

    public toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            url: this.url,
            dateStart: this.convertDate(this.dateStart),
            dateEnd: this.convertDate(this.dateEnd),
            imageId: this.imageId,
            image: this.image
        }
    }
}
