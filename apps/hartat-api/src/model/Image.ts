import { ImageRow } from "../repository/ImageRepository"

export class Image {
    constructor(
        public readonly id: number,
        public readonly key: string,
        public name: string,
        private readonly uploadedAt: string
    ) {}

    private convertDate(date: string) {
        return new Date(date?.replace(' ', 'T') + 'Z')
    }

    public static fromDatabase(data: ImageRow) {
        return new Image(
            data.id,
            data.key,
            data.name,
            data.uploaded_at
        )
    }

    public toJSON() {
        return {
            id: this.id,
            key: this.key,
            name: this.name,
            uploadedAt: this.convertDate(this.uploadedAt)
        }
    }
}