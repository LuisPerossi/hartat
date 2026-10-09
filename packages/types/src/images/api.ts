import { Pagination } from "../shared"
import { FailedImage, Image } from "./index"

interface BaseApiResponse {
    message: string,
    data: {}
}

export interface GetImagesResponse extends BaseApiResponse {
    data: {
        images: Image[],
        pagination: Pagination
    }
}

//Return empty arrays nontheless
export interface PostImagesResponse extends BaseApiResponse {
    data: {
        uploadedImages: Image[],
        failedImages: FailedImage[]
    }
}
