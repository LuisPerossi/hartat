import { Context } from "hono";
import { PostService } from "../service/PostService";
import { ContentfulError } from "../error/ContentfulError";
import { Post } from "../model/Post";

export class PostController {
    constructor(private service: PostService) {}

    async create(c: Context) {
        const body = await c.req.json()
        const { title, content } = body

        if (!title || !content) {
            throw new ContentfulError("Missing fields", 400)
        }

        const post: Post = await this.service.create(title, content)

        return c.json({ post: { id: post.id, title: post.title, content: post.content } }, 200)
    }
}