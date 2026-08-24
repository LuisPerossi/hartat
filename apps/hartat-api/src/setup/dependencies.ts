import { PostController } from "../controller/PostController"
import { PostRepository } from "../repository/PostRepository"
import { PostService } from "../service/PostService"

export function createDependencies(db: D1Database) {
    //Post Dependencies
    const postRepository = new PostRepository(db)
    const postService = new PostService(postRepository)
    const postController = new PostController(postService)

    return { postController }
}