import { API_URL } from "@/config/env"
import type { BannerAlignment, UpdatePostResponse, Post } from "@hartat/types/posts"

interface UpdatePostParams {
    title?: string
    slug?: string
    content?: string
    bannerAlignment?: BannerAlignment
    isHighlighted?: boolean
    categoryId?: number | null
    imageId?: number | null
}

export async function updatePost(id: number, params: UpdatePostParams): Promise<Post> {
    const payload: Record<string, unknown> = {}
    if (params.title !== undefined) payload.title = params.title
    if (params.slug !== undefined) payload.slug = params.slug
    if (params.content !== undefined) payload.content = params.content
    if (params.bannerAlignment !== undefined) payload.bannerAlignment = params.bannerAlignment
    if (params.isHighlighted !== undefined) payload.isHighlighted = params.isHighlighted
    if (params.categoryId !== undefined) payload.categoryId = params.categoryId
    if (params.imageId !== undefined) payload.imageId = params.imageId

    const response = await fetch(`${API_URL}/admin/posts/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })

    const body = await response.json() as UpdatePostResponse

    if (!response.ok || !body.data) {
        throw new Error(body.message || "Erro ao atualizar postagem")
    }

    return body.data.post
}
