import { API_URL } from "@/config/env"
import type { UpdateCategoryResponse } from "@hartat/types/categories"

interface RenameCategoryProps {
    id: number,
    name: string
}

export async function renameCategory({ id, name }: RenameCategoryProps) {
    const response = await fetch(`${API_URL}/admin/categories/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
    })

    const body = await response.json() as UpdateCategoryResponse
    if (!response.ok || !body.data) {
        throw new Error(body.message || 'Erro ao renomear categoria')
    }

    return body.data.category
}
