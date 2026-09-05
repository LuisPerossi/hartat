import { CreateCategory, UpdateCategory } from "../schema/category.schema";

export type CategoryRow = {
    readonly id: number,
    readonly name: string
}

export class CategoryRepository {
    constructor(private readonly db: D1Database) {}

    public async create(createCategory: CreateCategory) {
        const result = await this.db
            .prepare(`
                INSERT INTO 
                categories (name)
                VALUES (?)
                RETURNING id, name
            `)
            .bind(createCategory.name)
            .first<CategoryRow>()

        if (!result) { throw new Error('Unable to retrieve insert data') }

        return result
    }

    public async getById(id: number) {
        const result = await this.db
            .prepare(`
                SELECT id, name
                FROM categories
                WHERE id = ?    
            `)
            .bind(id)
            .first<CategoryRow>()

        return result
    }

    public async getAll() {
        const result = await this.db
            .prepare(`
                SELECT id, name
                FROM categories
                ORDER BY name ASC
            `)
            .all<CategoryRow>()
        
        return result.results
    }

    public async update(id: number, updateCategory: UpdateCategory) {
        const result = await this.db
            .prepare(`
                UPDATE categories
                SET name = ?     
                WHERE id = ?
                RETURNING id, name
            `)
            .bind(updateCategory.name, id)
            .first<CategoryRow>()
        
        return result
    }

    public async delete(id: number) {
        const result = await this.db
            .prepare(`
                DELETE FROM categories
                WHERE id = ?
            `)
            .bind(id)
            .run()

        return result.meta.changes > 0
    }

    public async count() {
        const result = await this.db
            .prepare(`
                SELECT COUNT(*) AS count
                FROM categories    
            `)
            .first<{ count: number }>()

        return result?.count ?? 0
    }
}