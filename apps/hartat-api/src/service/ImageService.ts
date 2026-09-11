import { ImageRepository } from "../repository/ImageRepository";
import { PhotonImage, resize, SamplingFilter } from "@cf-wasm/photon";
import { Image } from "../model/Image";
import { ErrorImage, GetImages, UpdateImage } from "../schema/image.schema";
import { NotFoundError } from "../error/NotFoundError";

export class ImageService {
    constructor(private readonly repository: ImageRepository) {}

    private async generateThumbnail(image: File) {
        const inputBytes = await image.arrayBuffer().then(buffer => new Uint8Array(buffer))
        const inputImage = PhotonImage.new_from_byteslice(inputBytes)

        const target = 300
        const width = inputImage.get_width()
        const height = inputImage.get_height()

        const ratio = Math.min(target / width, target / height)
        const targetWidth = Math.round(width * ratio)
        const targetHeight = Math.round(height * ratio)

        const outputImage = resize(inputImage, targetWidth, targetHeight, SamplingFilter.Lanczos3)
        const outputBytes = outputImage.get_bytes_webp()
        
        return new Blob([outputBytes], { type: 'image/webp' })
    }

    public async upload(images: File[]) {
        const uploadedImages: Image[] = []
        const errorImages: ErrorImage[] = []

        for (const image of images) {
            const data = { 
                key: crypto.randomUUID(), 
                name: image.name.substring(0, image.name.lastIndexOf('.')),
                extension: image.name.substring(image.name.lastIndexOf('.'))
            }

            try {
                const thumbnail = await this.generateThumbnail(image)
                const result = await this.repository.upload(image, thumbnail, data)

                if (result === null) { throw new Error('Unable to upload image') }

                uploadedImages.push(Image.fromDatabase(result))
            } catch {
                errorImages.push({ name: data.name, extension: data.extension })
            }
        }

        return { uploadedImages, errorImages }
    }

    public async getByKey(key: string) {
        const image = await this.repository.getByKey(key)

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