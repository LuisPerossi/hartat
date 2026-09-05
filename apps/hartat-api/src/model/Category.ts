import { CategoryRow } from "../repository/CategoryRepository";

export class Category {
    constructor(public readonly id: number, public name: string) {}

    public static fromDatabase(data: CategoryRow) {
        return new Category(data.id, data.name)
    }
}