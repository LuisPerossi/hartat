import { Image } from "../model/Image";
import { ImageRepository } from "../repository/ImageRepository";
import { GetImages, UpdateImage } from "../schema/image.schema";
import { NotFoundError } from "../error/NotFoundError";
import { BadRequestError } from "../error/BadRequestError";
import { imageDimensionsFromStream } from "image-dimensions";
import { FailedImage } from "@hartat/types/images";

const VALID_TYPES = [ 'image/png', 'image/jpeg', 'image/webp' ]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_THUMBNAIL_SIZE = 1 * 1024 * 1024 // 1MB
const MAX_IMAGE_PIXELS = 1920 * 1920
const MAX_THUMBNAIL_PIXELS = 600 * 600

export interface ImageUploadPair {
    image: File
    thumbnail: File
}

const createFailedImage = ({ name, type, size }: File, cause: string): FailedImage => ({ name, type, size, cause })

export class ImageService {
    constructor(private readonly repository: ImageRepository) {}

    private async validateFile(file: File, maxSize: number, maxPixels: number, label: 'File' | 'Thumbnail') {
        if (VALID_TYPES.includes(file.type) === false) {
            return label === 'Thumbnail' ? 'Invalid thumbnail file type' : 'Invalid file type'
        }

        if (file.size > maxSize) {
            const limitMb = Math.round(maxSize / (1024 * 1024))
            return `${label} size exceeds the ${limitMb}Mb limit`
        }

        const dimensions = await imageDimensionsFromStream(file.stream())

        if (dimensions === undefined) {
            return label === 'Thumbnail' ? 'Unable to read thumbnail image data' : 'Unable to read image data'
        }

        const totalPixels = dimensions.width * dimensions.height

        if (totalPixels > maxPixels) {
            return label === 'Thumbnail'
                ? `Thumbnail dimensions exceed the ${maxPixels}px limit`
                : `Image dimensions exceed the ${maxPixels}px limit`
        }

        return null
    }

    public async upload(files: ImageUploadPair[]) {
        const validPairs: ImageUploadPair[] = []
        const uploadedImages: Image[] = []
        const failedImages: FailedImage[] = []

        // Validates image + thumbnail pairs without heavy CPU/WASM processing
        for (const pair of files) {
            const imageError = await this.validateFile(pair.image, MAX_FILE_SIZE, MAX_IMAGE_PIXELS, 'File')
            if (imageError) {
                failedImages.push(createFailedImage(pair.image, imageError))
                continue
            }

            const thumbnailError = await this.validateFile(pair.thumbnail, MAX_THUMBNAIL_SIZE, MAX_THUMBNAIL_PIXELS, 'Thumbnail')
            if (thumbnailError) {
                failedImages.push(createFailedImage(pair.image, thumbnailError))
                continue
            }

            validPairs.push(pair)
        }

        // If there are no valid images left, return
        if (validPairs.length === 0) { return { uploadedImages, failedImages } }

        if (validPairs.length > 5) { throw new BadRequestError('Maximum of 5 images per upload') }

        // Proceed with upload and storage
        for (const { image, thumbnail } of validPairs) {
            const dotIndex = image.name.lastIndexOf('.')
            const data = {
                key: crypto.randomUUID(),
                name: dotIndex > 0 ? image.name.substring(0, dotIndex) : image.name,
                extension: dotIndex > 0 ? image.name.substring(dotIndex) : '.webp'
            }

            const result = await this.repository.upload(image, thumbnail, data)

            if (result === null) {
                failedImages.push(createFailedImage(image, 'Unable to store image, please try again'))
                continue
            }

            uploadedImages.push(Image.fromDatabase(result))
        }

        return { uploadedImages, failedImages }
    }

    public async getByKey(key: string, previewMode: boolean) {
        const image = await this.repository.getByKey(`${key}${previewMode ? '_thumbnail' : ''}`)

        if (image === null) { throw new NotFoundError('Image not found') }

        return image
    }

    public async getById(id: number) {
        const data = await this.repository.getById(id)

        if (data === null) { throw new NotFoundError('Image not found') }

        return Image.fromDatabase(data)
    }

    public async getAll(getImages: GetImages) {
        const data = await this.repository.getAll(getImages)
        const count = await this.repository.count(getImages.search)

        const { page, limit } = getImages
        const images: Image[] = []

        const pagination = {
            currentPage: page,
            perPage: limit,
            totalPages: Math.ceil(count / limit),
            totalRecords: count
        }

        for (const d of data) {
            images.push(Image.fromDatabase(d))
        }

        return { images, pagination }
    }

    public async update(id: number, updateImage: UpdateImage) {
        const data = await this.repository.update(id, updateImage)

        if (data === null) { throw new NotFoundError('Image not found') }

        return Image.fromDatabase(data)
    }

    public async delete(id: number) {
        const deleted = await this.repository.delete(id)

        if (!deleted) { throw new NotFoundError('Image not found') }
    }
}