import { Context } from "hono";
import { PostService } from "../service/PostService";
import { createPostSchema } from "../schema/post.schema";
import { jsonParser } from "../helper/jsonParser";
import { validate } from "../helper/validate";

export class PostController {
    constructor(private readonly service: PostService) {}

    public async create(c: Context) {
        const body = await jsonParser(c.req)

        const post = validate(createPostSchema, body)

        return c.json({ post }, 200)
    }
}