import { API_URL } from "@/config/env"
import type { GetImagesResponse } from "@hartat/types/images"

interface FetchImagesProps {
    search?: string,
    sort?: string,
    order?: string,
    page?: number,
    limit?: number
}

const FETCH_LIMIT = 30

export async function fetchImages(props: FetchImagesProps = {}) {
    const {
        search = "",
        sort = "date",
        order = "desc",
        page = 1,
        limit = FETCH_LIMIT
    } = props

    const params = new URLSearchParams({
        search,
        sort,
        order,
        page: String(page),
        limit: String(limit)
    })
    const response = await fetch(`${API_URL}/admin/images?${params.toString()}`)

    const body = await response.json() as GetImagesResponse   
    if (body.data === undefined) { throw new Error(body.message) }

    return { 
        images: body.data.images, 
        pagination: body.data.pagination 
    }
}