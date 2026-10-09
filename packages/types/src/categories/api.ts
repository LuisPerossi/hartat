import type { Category } from "./index"
import type { Pagination } from "../shared"

interface BaseApiResponse {
    message: string,
    data: {}
}

export interface GetCategoriesResponse extends BaseApiResponse {
    data: {
        categories: Category[],
        pagination: Pagination
    }
}