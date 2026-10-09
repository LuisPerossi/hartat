import type { BaseApiResponse, Pagination } from "../shared"
import type { FailedImage, Image } from "./index"

export interface GetImagesResponse extends BaseApiResponse<{
    images: Image[],
    pagination: Pagination
}> {}

export interface PostImagesResponse extends BaseApiResponse<{
    uploadedImages: Image[],
    failedImages: FailedImage[]
}> {}