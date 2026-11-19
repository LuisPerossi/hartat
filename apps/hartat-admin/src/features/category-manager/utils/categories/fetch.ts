import { API_URL } from "@/config/env"
import type { GetCategoriesResponse } from "@hartat/types/categories"

export async function fetchCategories() {
    const response = await fetch(`${API_URL}/admin/categories`)

    const body = await response.json() as GetCategoriesResponse
    if (!response.ok || !body.data) {
        throw new Error(body.message || 'Erro ao carregar categorias')
    }

    return body.data.categories
}
