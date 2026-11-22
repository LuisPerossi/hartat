import { API_URL } from "@/config/env"
import type { CreateCategoryResponse } from "@hartat/types/categories"

interface CreateCategoryProps {
    name: string
    color?: string
}

export async function createCategory({ name, color }: CreateCategoryProps) {
    const response = await fetch(`${API_URL}/admin/categories`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, color })
    })

    const body = await response.json() as CreateCategoryResponse
    if (!response.ok || !body.data) {
        throw new Error(body.message || 'Erro ao criar categoria')
    }

    return body.data.category
}
