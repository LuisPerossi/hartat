import { CreateCategory, UpdateCategory } from "../schema/category.schema";

export type CategoryRow = {
    readonly id: number,
    readonly name: string,
    readonly color?: string | null,
    readonly post_count?: number | null
}

export class CategoryRepository {
    constructor(private readonly db: D1Database) {}

    public async create(createCategory: CreateCategory) {
        const color = createCategory.color ?? '#C58852'
        const result = await this.db
            .prepare(`
                INSERT INTO 
                categories (name, color)
                VALUES (?, ?)
                RETURNING id, name, color
            `)
            .bind(createCategory.name, color)
            .first<CategoryRow>()

        if (!result) { throw new Error('Unable to retrieve insert data') }

        return result
    }

    public async getById(id: number) {
        const result = await this.db
            .prepare(`
                SELECT 
                    c.id, 
                    c.name,
                    c.color,
                    COUNT(p.id) AS post_count
                FROM categories c
                LEFT JOIN posts p ON c.id = p.category_id
                WHERE c.id = ?
                GROUP BY c.id
            `)
            .bind(id)
            .first<CategoryRow>()

        return result
    }

    public async getAll() {
        const result = await this.db
            .prepare(`
                SELECT 
                    c.id, 
                    c.name,
                    c.color,
                    COUNT(p.id) AS post_count
                FROM categories c
                LEFT JOIN posts p ON c.id = p.category_id
                GROUP BY c.id
                ORDER BY c.name ASC
            `)
            .all<CategoryRow>()
        
        return result.results
    }

    public async update(id: number, updateCategory: UpdateCategory) {
        const updates: string[] = []
        const bindings: (string | number)[] = []

        if (updateCategory.name !== undefined) {
            updates.push('name = ?')
            bindings.push(updateCategory.name)
        }

        if (updateCategory.color !== undefined) {
            updates.push('color = ?')
            bindings.push(updateCategory.color)
        }

        if (updates.length === 0) {
            return this.getById(id)
        }

        bindings.push(id)

        const result = await this.db
            .prepare(`
                UPDATE categories
                SET ${updates.join(', ')}     
                WHERE id = ?
                RETURNING id, name, color
            `)
            .bind(...bindings)
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
