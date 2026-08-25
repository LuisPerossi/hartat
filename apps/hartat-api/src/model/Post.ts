export class Post {
    constructor(
        public readonly id: number | null,
        public title: string,
        public content: string,
        private readonly createdAt?: string,
        private readonly editedAt?: string
    ) {}

    private convertDate(date: string | undefined) {
        if (!date) { return null }
        return new Date(date?.replace(' ', 'T') + 'Z')
    }
    
    public toObject() {
        return {
            id: this.id,
            title: this.title,
            content: this.content,
            createdAt: this.convertDate(this.createdAt),
            editedAt: this.convertDate(this.editedAt)
        }
    }
}