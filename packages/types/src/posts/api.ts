import type { BaseApiResponse, Pagination } from "../shared"
import type { Post } from "./index"

export interface GetPostsResponse extends BaseApiResponse<{
    posts: Post[]
    pagination: Pagination
}> {}

export interface GetPostResponse extends BaseApiResponse<{
    post: Post
}> {}

export interface CreatePostResponse extends BaseApiResponse<{
    post: Post
}> {}

export interface UpdatePostResponse extends BaseApiResponse<{
    post: Post
}> {}
