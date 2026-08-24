import { ContentfulError } from "../error/ContentfulError";
import { Post } from "../model/Post";

export class PostRepository {
    constructor(private db: D1Database) {}

    public async create(post: Post) {
        const result = 
            await this.db.prepare(`
                INSERT INTO posts (title, content) 
                VALUES (?, ?) 
                RETURNING id
            `)
            .bind(post.title, post.content)
            .first<{ id: number }>()
            
        if (!result?.id) {
            throw new Error('Unable to insert post into database')
        }

        return new Post(
            result.id,
            post.title,
            post.content
        )
    }

    public async getById(id: number) {
        const result = 
            await this.db.prepare(`
                SELECT *
                FROM posts
                WHERE id = ?    
            `)
            .bind(id)
            .first<{ id: number, title: string, content: string }>()

        if (!result) {
            throw new ContentfulError("Unable to locate post", 404)
        }

        return new Post(result.id, result.title, result.content)
    }

    public async update(post: Post) {
        const result = 
            await this.db.prepare(`
                UPDATE posts
                SET title = ?, content = ?
                WHERE id = ?
            `)
            .bind(post.title, post.content, post.id)
            .run()

        if (!result.success) {
            throw new Error('Unable to update post in database')
        }

        if (result.meta.changes === 0) {
            throw new ContentfulError('Unable to find the requested post', 404)
        }

        return post
    }

    public async delete(id: number) {
        const result = 
            await this.db.prepare(`
                DELETE FROM posts
                WHERE id = ?    
            `)
            .bind(id)
            .run()

        if (!result.success) {
            throw new Error('Unable to delete post in database')
        }

        if (result.meta.changes === 0) {
            throw new ContentfulError('Unable to find the requested post', 404)
        }
    }
}