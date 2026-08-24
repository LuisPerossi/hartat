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
}