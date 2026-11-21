import { Context } from "hono";
import { PostService } from "../service/PostService";
import { BadRequestError } from "../error/BadRequestError";
import { idParser } from "../helper/idParser";
import { jsonParser } from "../helper/jsonParser";
import { validate } from "../helper/validate";
import { createPostSchema, getPostsSchema, updatePostSchema } from "../schema/post.schema";

export class PostController {
    constructor(private readonly service: PostService) {}

    public async create(c: Context) {
        const body = await jsonParser(c.req)

        const createPost = validate(createPostSchema, body)

        const post = await this.service.create(createPost)

        return c.json({ message: 'Created post', data: { post } }, 201)
    }

    public async getById(c: Context) {
        const id = idParser(c.req)

        const post = await this.service.getById(id)

        return c.json({ message: 'Retrieved post', data: { post } }, 200)
    }

    public async getBySlug(c: Context) {
        const slug = c.req.param('slug')
        if (!slug) {
            throw new BadRequestError('Invalid slug')
        }

        const post = await this.service.getBySlug(slug)

        return c.json({ message: 'Retrieved post', data: { post } }, 200)
    }

    public async getAll(c: Context) {
        const query = c.req.query()

        const getPosts = validate(getPostsSchema, query)

        const { posts, pagination } = await this.service.getAll(getPosts)

        return c.json({ message: 'Retrieved posts', data: { posts, pagination } }, 200)
    }

    public async update(c: Context) {
        const id = idParser(c.req)
        const body = await jsonParser(c.req)

        const updatePost = validate(updatePostSchema, body)

        const post = await this.service.update(id, updatePost)

        return c.json({ message: 'Updated post', data: { post } }, 200)
    }

    public async delete(c: Context) {
        const id = idParser(c.req)

        await this.service.delete(id)

        return c.json({ message: 'Deleted post' }, 200)
    }
}
