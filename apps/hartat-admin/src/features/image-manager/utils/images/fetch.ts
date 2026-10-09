import { API_URL } from "@/config/env"
import type { GetImagesResponse } from "@hartat/types/images"

interface FetchImagesProps {
    search: string,
    sort: string,
    order: string,
    page: number
}

const FETCH_LIMIT = 30

export async function fetchImages(props: FetchImagesProps) {
    const { search, sort, order, page } = props

    const query = `search=${search}&sort=${sort}&order=${order}&page=${page}&limit=${FETCH_LIMIT}`
    const response = await fetch(`${API_URL}/admin/images?${query}`)

    const body = await response.json() as GetImagesResponse   
    if (body.data === undefined) { throw new Error(body.message) }

    return { 
        images: body.data.images, 
        pagination: body.data.pagination 
    }
}