import { API_URL } from "@/config/env"
import type { UpdateCategoryResponse } from "@hartat/types/categories"

export interface UpdateCategoryProps {
    id: number
    name?: string
    color?: string
}

export async function updateCategory({ id, name, color }: UpdateCategoryProps) {
    const response = await fetch(`${API_URL}/admin/categories/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, color })
    })

    const body = await response.json() as UpdateCategoryResponse
    if (!response.ok || !body.data) {
        throw new Error(body.message || 'Erro ao atualizar categoria')
    }

    return body.data.category
}

// Alias for backwards compatibility
export const renameCategory = updateCategory
