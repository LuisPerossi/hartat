import { Post } from "../model/Post";
import { PostRepository } from "../repository/PostRepository";

export class PostService{
    constructor(private repository: PostRepository) {}

    public async create(title: string,  content: string) {
        const post = new Post(null, title, content)
        return await this.repository.create(post)
    }
}