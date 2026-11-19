import type { BaseApiResponse } from "../shared"
import type { Category } from "./index"

export interface GetCategoriesResponse extends BaseApiResponse<{
    categories: Category[]
}> {}

export interface CreateCategoryResponse extends BaseApiResponse<{
    category: Category
}> {}

export interface UpdateCategoryResponse extends BaseApiResponse<{
    category: Category
}> {}
