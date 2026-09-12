import { Image } from "../model/Image";
import { ImageRepository } from "../repository/ImageRepository";
import { GetImages, UpdateImage } from "../schema/image.schema";
import { NotFoundError } from "../error/NotFoundError";
import { optimizeImage } from "wasm-image-optimization/workerd";
import { PhotonImage, resize, SamplingFilter } from "@cf-wasm/photon";

export class ImageService {
    constructor(private readonly repository: ImageRepository) {}

    private async process(image: File) {
        const input = new Uint8Array(await image.arrayBuffer())
        const photonImage = PhotonImage.new_from_byteslice(input)

        const originalWidth = photonImage.get_width()
        const originalHeight = photonImage.get_height()

        const webpSize = 1920
        const webpRatio = Math.min(1, webpSize / originalWidth, webpSize / originalHeight)
        const webpWidth = Math.round(originalWidth * webpRatio)

        const { data: webpBytes } = await optimizeImage({ image: input, format: 'webp', width: webpWidth, quality: 80 })
        const webp = new Blob([webpBytes], { type: 'image/webp' })

        const thumbnailSize = 300
        const thumbnailRatio = Math.min(1, thumbnailSize / originalWidth, thumbnailSize / originalHeight)
        const thumbnailWidth = Math.round(originalWidth * thumbnailRatio)
        const thumbnailHeight = Math.round(originalHeight * thumbnailRatio)

        const photonOutput = resize(photonImage, thumbnailWidth, thumbnailHeight, SamplingFilter.Lanczos3)
        const thumbnailBytes = photonOutput.get_bytes_webp()
        const thumbnail = new Blob([thumbnailBytes], { type: 'image/webp' })

        photonImage.free()
        photonOutput.free()

        return { webp, thumbnail }
    }

    public async upload(images: File[]) {
        const uploadedImages: Image[] = []
        const errorImages: string[] = []

        for (const image of images) {
            const data = { 
                key: crypto.randomUUID(), 
                name: image.name.substring(0, image.name.lastIndexOf('.')),
                //extension: image.name.substring(image.name.lastIndexOf('.'))
            }

            try {
                const { webp, thumbnail } = await this.process(image)
                const result = await this.repository.upload(webp, thumbnail, data)

                if (result === null) { throw new Error('Unable to upload image') }

                uploadedImages.push(Image.fromDatabase(result))
            } catch {
                errorImages.push(image.name)
            }
        }

        return { uploadedImages, errorImages }
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