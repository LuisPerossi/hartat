import { API_URL } from "@/config/env"
import type { MessageOnlyResponse } from "@hartat/types/shared"

export async function deletePost(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/admin/posts/${id}`, {
        method: "DELETE"
    })

    const body = await response.json() as MessageOnlyResponse

    if (!response.ok) {
        throw new Error(body.message || "Erro ao excluir postagem")
    }
}
