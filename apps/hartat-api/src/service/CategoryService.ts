import { ContentfulError } from "../error/ContentfulError";
import { NotFoundError } from "../error/NotFoundError";
import { Category } from "../model/Category";
import { CategoryRepository } from "../repository/CategoryRepository";
import { CreateCategory, UpdateCategory } from "../schema/category.schema";

export class CategoryService {
    constructor(private readonly repository: CategoryRepository) {}

    public async create(createCategory: CreateCategory) {
        const count = await this.repository.count()

        if (count >= 20) { throw new ContentfulError('Maximum number of categories reached', 409)}

        const data = await this.repository.create(createCategory)

        return Category.fromDatabase(data)
    }

    public async getById(id: number) {
        const data = await this.repository.getById(id)

        if (!data) { throw new NotFoundError('Category not found') }

        return Category.fromDatabase(data)
    }

    public async getAll() {
        const data = await this.repository.getAll()

        return data.map(Category.fromDatabase)
    }

    public async update(id: number, updateCategory: UpdateCategory) {
        const data = await this.repository.update(id, updateCategory)

        if (!data) { throw new NotFoundError('Category not found') }

        return Category.fromDatabase(data)
    }

    public async delete(id: number) {
        const deleted = await this.repository.delete(id)

        if (!deleted) { throw new NotFoundError('Category not found') }
    }
}