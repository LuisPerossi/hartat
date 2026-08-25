import { Context, Next } from "hono"
import { PostController } from "./controller/PostController"
import { PostRepository } from "./repository/PostRepository"
import { PostService } from "./service/PostService"
import { HonoEnv } from "./types/hono"

export function createDependencies(db: D1Database) {
    //Post Dependencies
    const postRepository = new PostRepository(db)
    const postService = new PostService(postRepository)
    const postController = new PostController(postService)

    return { postController }
}

export async function dependencies(c: Context<HonoEnv>, next: Next) {
    c.set('dependencies', createDependencies(c.env.db))
    return await next()
}