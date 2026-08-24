import { Context } from "hono";
import { PostService } from "../service/PostService";
import { ContentfulError } from "../error/ContentfulError";
import { Post } from "../model/Post";

export class PostController {
    constructor(private service: PostService) {}

    async create(c: Context) {
        const body = await c.req.json<{ id: number, title: string, content: string}>()
        const { title, content } = body

        if (!title || !content) {
            throw new ContentfulError("Missing fields", 400)
        }

        const post = await this.service.create(title, content)

        return c.json({ message: "Created post", post: { id: post.id, title: post.title, content: post.content } }, 200)
    }

    async getById(c: Context) {
        const id = Number(c.req.param('id'))

        if (!id) {
            throw new ContentfulError("A valid post id was not provided", 400)
        }

        const post = await this.service.getById(id)

        return c.json({ message: "Retrieved post", post: post.toObject() }, 200)
    }

    async update(c: Context) {
        const body = await c.req.json<{ id: number, title: string, content: string}>()
        const { id, title, content } = body

        if (!id || !title || !content) {
            throw new ContentfulError("Missing fields", 400)
        }

        const post = await this.service.update(id, title, content)

        return c.json({ message: "Updated post", post: { id: post.id, title: post.title, content: post.content } }, 200)
    }

    async delete(c: Context) {
        const id = Number(c.req.param('id'))

        if (!id) {
            throw new ContentfulError("A valid post id was not provided", 400)
        }

        await this.service.delete(id)

        return c.json({ message: "Deleted post" }, 200)
    }
}