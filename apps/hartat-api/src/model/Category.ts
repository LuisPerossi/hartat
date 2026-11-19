import { CategoryRow } from "../repository/CategoryRepository";

export class Category {
    constructor(
        public readonly id: number, 
        public name: string,
        public readonly postCount?: number
    ) {}

    public static fromDatabase(data: CategoryRow) {
        return new Category(
            data.id,
            data.name,
            data.post_count !== undefined && data.post_count !== null
                ? Number(data.post_count)
                : 0
        )
    }

    public toJSON() {
        return {
            id: this.id,
            name: this.name,
            postCount: this.postCount ?? 0
        }
    }
}