export class Post {
    constructor(
        public readonly id: number | null,
        public title: string,
        public content: string
    ) {}
}