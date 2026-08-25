import { PostRepository } from "../repository/PostRepository";

export class PostService {
    constructor(private readonly repository: PostRepository) {}
}