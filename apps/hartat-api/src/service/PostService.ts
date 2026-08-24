import { Post } from "../model/Post";
import { PostRepository } from "../repository/PostRepository";

export class PostService{
    constructor(private repository: PostRepository) {}

    public async create(title: string,  content: string) {
        const post = new Post(null, title, content)
        return await this.repository.create(post)
    }

    public async getById(id: number) {
        return this.repository.getById(id)
    }

    public async update(id: number, title: string, content: string) {
        const post = new Post(id, title, content)
        return await this.repository.update(post)
    }

    public async delete(id: number) {
        await this.repository.delete(id)
    }
}