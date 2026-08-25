import { PostService } from "../service/PostService";

export class PostController {
    constructor(private readonly service: PostService) {}
}