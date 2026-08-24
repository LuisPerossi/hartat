export class Post {
    constructor(
        public readonly id: number | null,
        public title: string,
        public content: string
    ) {}

    public toObject() {
        return {
            id: this.id,
            title: this.title,
            content: this.content
        }
    }
}