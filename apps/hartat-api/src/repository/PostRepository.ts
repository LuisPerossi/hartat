import { CreatePost, GetPosts, UpdatePost } from "../schema/post.schema";

export type PostRow = {
    readonly id: number
    readonly title: string
    readonly slug: string | null
    readonly content: string
    readonly banner_alignment: string | null
    readonly is_highlighted: number | null
    readonly created_at: string
    readonly updated_at: string
    readonly category_id: number | null
    readonly image_id: number | null
    readonly category_name?: string | null
    readonly category_color?: string | null
    readonly image_key?: string | null
    readonly image_name?: string | null
    readonly image_extension?: string | null
}

export class PostRepository {
    constructor(private readonly db: D1Database) {}

    public async create(createPost: CreatePost & { slug: string }) {
        const result = await this.db
            .prepare(`
                INSERT INTO 
                posts (title, slug, content, banner_alignment, is_highlighted, category_id, image_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                RETURNING id
            `)
            .bind(
                createPost.title,
                createPost.slug,
                createPost.content,
                createPost.bannerAlignment ?? 'center',
                createPost.isHighlighted ? 1 : 0,
                createPost.categoryId ?? null,
                createPost.imageId ?? null
            )
            .first<{ id: number }>()

        if (!result) { throw new Error('Unable to retrieve insert data') }

        const post = await this.getById(result.id)
        if (!post) { throw new Error('Unable to retrieve inserted post') }

        return post
    }

    public async getById(id: number) {
        const result = await this.db
            .prepare(`
                SELECT 
                    p.id, 
                    p.title, 
                    p.slug,
                    p.content, 
                    p.banner_alignment,
                    p.is_highlighted,
                    p.created_at, 
                    p.updated_at, 
                    p.category_id, 
                    p.image_id,
                    c.name AS category_name,
                    c.color AS category_color,
                    i.key AS image_key,
                    i.name AS image_name,
                    i.extension AS image_extension
                FROM posts p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN images i ON p.image_id = i.id
                WHERE p.id = ?
            `)
            .bind(id)
            .first<PostRow>()

        return result
    }

    public async getBySlug(slug: string) {
        const result = await this.db
            .prepare(`
                SELECT 
                    p.id, 
                    p.title, 
                    p.slug,
                    p.content, 
                    p.banner_alignment,
                    p.is_highlighted,
                    p.created_at, 
                    p.updated_at, 
                    p.category_id, 
                    p.image_id,
                    c.name AS category_name,
                    c.color AS category_color,
                    i.key AS image_key,
                    i.name AS image_name,
                    i.extension AS image_extension
                FROM posts p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN images i ON p.image_id = i.id
                WHERE p.slug = ?
            `)
            .bind(slug)
            .first<PostRow>()

        return result
    }

    public async slugExists(slug: string, excludeId?: number) {
        if (excludeId !== undefined) {
            const result = await this.db
                .prepare(`
                    SELECT id
                    FROM posts
                    WHERE slug = ? AND id != ?
                `)
                .bind(slug, excludeId)
                .first<{ id: number }>()

            return result !== null
        }

        const result = await this.db
            .prepare(`
                SELECT id
                FROM posts
                WHERE slug = ?
            `)
            .bind(slug)
            .first<{ id: number }>()

        return result !== null
    }

    public async countHighlighted(excludeId?: number) {
        if (excludeId !== undefined) {
            const result = await this.db
                .prepare(`
                    SELECT COUNT(*) AS count
                    FROM posts
                    WHERE is_highlighted = 1 AND id != ?
                `)
                .bind(excludeId)
                .first<{ count: number }>()

            return result?.count ?? 0
        }

        const result = await this.db
            .prepare(`
                SELECT COUNT(*) AS count
                FROM posts
                WHERE is_highlighted = 1
            `)
            .first<{ count: number }>()

        return result?.count ?? 0
    }

    public async getAll(getPosts: GetPosts) {
        const { page, limit, search, categoryId, isHighlighted, sort, order } = getPosts

        const offset = (page - 1) * limit
        const sortColumn = {
            title: 'p.title',
            date: 'p.created_at',
            updated: 'p.updated_at'
        }[sort]

        const whereClauses: string[] = ['p.title LIKE ?']
        const bindings: (string | number)[] = [search ? `%${search}%` : '%']

        if (categoryId !== undefined) {
            whereClauses.push('p.category_id = ?')
            bindings.push(categoryId)
        }

        if (isHighlighted !== undefined) {
            whereClauses.push('p.is_highlighted = ?')
            bindings.push(isHighlighted ? 1 : 0)
        }

        const { results } = await this.db
            .prepare(`
                SELECT 
                    p.id, 
                    p.title, 
                    p.slug,
                    p.content, 
                    p.banner_alignment,
                    p.is_highlighted,
                    p.created_at, 
                    p.updated_at, 
                    p.category_id, 
                    p.image_id,
                    c.name AS category_name,
                    c.color AS category_color,
                    i.key AS image_key,
                    i.name AS image_name,
                    i.extension AS image_extension
                FROM posts p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN images i ON p.image_id = i.id
                WHERE ${whereClauses.join(' AND ')}
                ORDER BY ${sortColumn} ${order}
                LIMIT ? OFFSET ?
            `)
            .bind(...bindings, limit, offset)
            .all<PostRow>()

        return results
    }

    public async count(filter: { search?: string, categoryId?: number, isHighlighted?: boolean }) {
        const { search, categoryId, isHighlighted } = filter

        const whereClauses: string[] = ['title LIKE ?']
        const bindings: (string | number)[] = [search ? `%${search}%` : '%']

        if (categoryId !== undefined) {
            whereClauses.push('category_id = ?')
            bindings.push(categoryId)
        }

        if (isHighlighted !== undefined) {
            whereClauses.push('is_highlighted = ?')
            bindings.push(isHighlighted ? 1 : 0)
        }

        const result = await this.db
            .prepare(`
                SELECT COUNT(*) AS count
                FROM posts
                WHERE ${whereClauses.join(' AND ')}
            `)
            .bind(...bindings)
            .first<{ count: number }>()

        return result?.count ?? 0
    }

    public async update(id: number, updatePost: UpdatePost) {
        const fields: string[] = []
        const values: unknown[] = []

        if (updatePost.title !== undefined) {
            fields.push('title = ?')
            values.push(updatePost.title)
        }

        if (updatePost.slug !== undefined) {
            fields.push('slug = ?')
            values.push(updatePost.slug)
        }

        if (updatePost.content !== undefined) {
            fields.push('content = ?')
            values.push(updatePost.content)
        }

        if (updatePost.bannerAlignment !== undefined) {
            fields.push('banner_alignment = ?')
            values.push(updatePost.bannerAlignment)
        }

        if (updatePost.isHighlighted !== undefined) {
            fields.push('is_highlighted = ?')
            values.push(updatePost.isHighlighted ? 1 : 0)
        }

        if (updatePost.categoryId !== undefined) {
            fields.push('category_id = ?')
            values.push(updatePost.categoryId)
        }

        if (updatePost.imageId !== undefined) {
            fields.push('image_id = ?')
            values.push(updatePost.imageId)
        }

        fields.push('updated_at = CURRENT_TIMESTAMP')
        values.push(id)

        const result = await this.db
            .prepare(`
                UPDATE posts
                SET ${fields.join(', ')}
                WHERE id = ?
                RETURNING id
            `)
            .bind(...values)
            .first<{ id: number }>()

        if (!result) { return null }

        return await this.getById(result.id)
    }

    public async delete(id: number) {
        const result = await this.db
            .prepare(`
                DELETE FROM posts
                WHERE id = ?
            `)
            .bind(id)
            .run()

        return result.meta.changes > 0
    }

    public async categoryExists(categoryId: number) {
        const result = await this.db
            .prepare(`
                SELECT id
                FROM categories
                WHERE id = ?
            `)
            .bind(categoryId)
            .first<{ id: number }>()

        return result !== null
    }

    public async imageExists(imageId: number) {
        const result = await this.db
            .prepare(`
                SELECT id
                FROM images
                WHERE id = ?
            `)
            .bind(imageId)
            .first<{ id: number }>()

        return result !== null
    }
}
