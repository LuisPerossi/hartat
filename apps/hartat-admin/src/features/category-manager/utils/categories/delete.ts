import { API_URL } from "@/config/env"
import type { MessageOnlyResponse } from "@hartat/types/shared"

interface DeleteCategoryProps {
    id: number
}

export async function deleteCategory({ id }: DeleteCategoryProps) {
    const response = await fetch(`${API_URL}/admin/categories/${id}`, {
        method: 'DELETE'
    })

    if (!response.ok) {
        const body = await response.json() as MessageOnlyResponse
        throw new Error(body.message || 'Erro ao excluir categoria')
    }
}
