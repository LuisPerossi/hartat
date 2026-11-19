import { API_URL } from "@/config/env"
import type { GetPostsResponse, GetPostResponse, Post } from "@hartat/types/posts"

interface FetchPostsProps {
    search?: string
    categoryId?: number
    sort?: 'title' | 'date'
    order?: 'asc' | 'desc'
    page?: number
    limit?: number
}

const DEFAULT_LIMIT = 10

export async function fetchPosts(props: FetchPostsProps = {}) {
    const {
        search = "",
        categoryId,
        sort = "date",
        order = "desc",
        page = 1,
        limit = DEFAULT_LIMIT
    } = props

    const params = new URLSearchParams()
    if (search.trim()) params.set("search", search.trim())
    if (categoryId !== undefined) params.set("categoryId", String(categoryId))
    params.set("sort", sort)
    params.set("order", order)
    params.set("page", String(page))
    params.set("limit", String(limit))

    const response = await fetch(`${API_URL}/admin/posts?${params.toString()}`)
    const body = await response.json() as GetPostsResponse

    if (!response.ok || !body.data) {
        throw new Error(body.message || "Erro ao carregar postagens")
    }

    return {
        posts: body.data.posts,
        pagination: body.data.pagination
    }
}

export async function fetchPostById(id: number): Promise<Post> {
    const response = await fetch(`${API_URL}/admin/posts/${id}`)
    const body = await response.json() as GetPostResponse

    if (!response.ok || !body.data) {
        throw new Error(body.message || "Erro ao carregar postagem")
    }

    return body.data.post
}
