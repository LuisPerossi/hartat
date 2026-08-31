import { CategoryRepository } from "../repository/CategoryRepository";

export class CategoryService {
    constructor(private readonly repository: CategoryRepository) {}
}