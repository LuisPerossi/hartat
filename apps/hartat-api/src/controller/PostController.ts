import { Context } from "hono";
import { PostService } from "../service/PostService";
import { createPostSchema } from "../schema/post.schema";
import { parse } from "../helper/parse";

export class PostController {
    constructor(private readonly service: PostService) {}

    public async create(c: Context) {
        const body = await c.req.json()

        const post = parse(createPostSchema, body)

        return c.json({ post }, 200)
    }
}