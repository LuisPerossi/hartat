import { NotFoundError } from "../error/NotFoundError";
import { Post } from "../model/Post";
import { PostRepository } from "../repository/PostRepository";
import { CreatePost, GetPosts, UpdatePost } from "../schema/post.schema";

export class PostService {
    constructor(private readonly repository: PostRepository) {}

    public async create(createPost: CreatePost) {
        if (createPost.categoryId) {
            const exists = await this.repository.categoryExists(createPost.categoryId)
            if (!exists) {
                throw new NotFoundError('Category not found')
            }
        }

        if (createPost.imageId) {
            const exists = await this.repository.imageExists(createPost.imageId)
            if (!exists) {
                throw new NotFoundError('Image not found')
            }
        }

        const data = await this.repository.create(createPost)

        return Post.fromDatabase(data)
    }

    public async getById(id: number) {
        const data = await this.repository.getById(id)

        if (!data) { throw new NotFoundError('Post not found') }

        return Post.fromDatabase(data)
    }

    public async getAll(getPosts: GetPosts) {
        const data = await this.repository.getAll(getPosts)
        const count = await this.repository.count({
            search: getPosts.search,
            categoryId: getPosts.categoryId
        })

        const { page, limit } = getPosts
        const posts = data.map(Post.fromDatabase)

        const pagination = {
            currentPage: page,
            perPage: limit,
            totalPages: Math.ceil(count / limit),
            totalRecords: count
        }

        return { posts, pagination }
    }

    public async update(id: number, updatePost: UpdatePost) {
        if (updatePost.categoryId) {
            const exists = await this.repository.categoryExists(updatePost.categoryId)
            if (!exists) {
                throw new NotFoundError('Category not found')
            }
        }

        if (updatePost.imageId) {
            const exists = await this.repository.imageExists(updatePost.imageId)
            if (!exists) {
                throw new NotFoundError('Image not found')
            }
        }

        const data = await this.repository.update(id, updatePost)

        if (!data) { throw new NotFoundError('Post not found') }

        return Post.fromDatabase(data)
    }

    public async delete(id: number) {
        const deleted = await this.repository.delete(id)

        if (!deleted) { throw new NotFoundError('Post not found') }
    }
}
