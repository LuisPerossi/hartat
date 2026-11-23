import { ContentfulError } from "../error/ContentfulError";
import { NotFoundError } from "../error/NotFoundError";
import { Post } from "../model/Post";
import { PostRepository } from "../repository/PostRepository";
import { CreatePost, GetPosts, UpdatePost } from "../schema/post.schema";

function generateSlug(text: string): string {
    const slug = text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

    return slug || 'post'
}

export class PostService {
    constructor(private readonly repository: PostRepository) {}

    private async generateUniqueSlug(baseText: string): Promise<string> {
        const base = generateSlug(baseText)
        if (!(await this.repository.slugExists(base))) {
            return base
        }

        let suffix = 2
        while (await this.repository.slugExists(`${base}-${suffix}`)) {
            suffix++
        }

        return `${base}-${suffix}`
    }

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

        if (createPost.isHighlighted) {
            const highlightedCount = await this.repository.countHighlighted()
            if (highlightedCount >= 10) {
                throw new ContentfulError('Limite de 10 postagens em destaque atingido. Desmarque o destaque de outra postagem antes de destacar esta.', 400)
            }
        }

        let slug: string
        if (createPost.slug) {
            const exists = await this.repository.slugExists(createPost.slug)
            if (exists) {
                throw new ContentfulError('Já existe uma postagem com este slug', 409)
            }
            slug = createPost.slug
        } else {
            slug = await this.generateUniqueSlug(createPost.title)
        }

        const data = await this.repository.create({ ...createPost, slug })

        return Post.fromDatabase(data)
    }

    public async getById(id: number) {
        const data = await this.repository.getById(id)

        if (!data) { throw new NotFoundError('Post not found') }

        return Post.fromDatabase(data)
    }

    public async getBySlug(slug: string) {
        const data = await this.repository.getBySlug(slug)

        if (!data) { throw new NotFoundError('Post not found') }

        return Post.fromDatabase(data)
    }

    public async getAll(getPosts: GetPosts) {
        const data = await this.repository.getAll(getPosts)
        const count = await this.repository.count({
            search: getPosts.search,
            categoryId: getPosts.categoryId,
            isHighlighted: getPosts.isHighlighted
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

        if (updatePost.isHighlighted) {
            const highlightedCount = await this.repository.countHighlighted(id)
            if (highlightedCount >= 10) {
                throw new ContentfulError('Limite de 10 postagens em destaque atingido. Desmarque o destaque de outra postagem antes de destacar esta.', 400)
            }
        }

        if (updatePost.slug !== undefined) {
            const exists = await this.repository.slugExists(updatePost.slug, id)
            if (exists) {
                throw new ContentfulError('Já existe uma postagem com este slug', 409)
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
