import { API_URL } from "@/config/env"
import type { CreatePostResponse, Post } from "@hartat/types/posts"

interface CreatePostParams {
    title: string
    content: string
    categoryId?: number | null
    imageId?: number | null
}

export async function createPost(params: CreatePostParams): Promise<Post> {
    const response = await fetch(`${API_URL}/admin/posts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: params.title,
            content: params.content,
            categoryId: params.categoryId ?? null,
            imageId: params.imageId ?? null
        })
    })

    const body = await response.json() as CreatePostResponse

    if (!response.ok || !body.data) {
        throw new Error(body.message || "Erro ao criar postagem")
    }

    return body.data.post
}
