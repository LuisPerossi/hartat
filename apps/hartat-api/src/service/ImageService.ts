import { Image } from "../model/Image";
import { ImageRepository } from "../repository/ImageRepository";
import { ErrorImage, GetImages, UpdateImage } from "../schema/image.schema";
import { NotFoundError } from "../error/NotFoundError";
import { BadRequestError } from "../error/BadRequestError";
import { PhotonImage, resize } from "@cf-wasm/photon";
import { imageDimensionsFromStream } from "image-dimensions";

const VALID_TYPES = [ 'image/png', 'image/jpeg', 'image/webp' ]
const MAX_FILE_SIZE = 5 * 1024 * 1024 //5Mb
const MAX_IMAGE_PIXELS = 1920 * 1920
const THUMBNAIL_SIZE = 300
const errImg = ({ name, type, size }: File, cause: string): ErrorImage => ({ name, type, size, cause })

export class ImageService {
    constructor(private readonly repository: ImageRepository) {}

    //Thumbnail might be generated in the admin panel in the future
    private async generateThumbnail(image: File) {
        try {
            const input = await image.bytes()
            const photonInput = PhotonImage.new_from_byteslice(input)

            const originalWidth = photonInput.get_width()
            const originalHeight = photonInput.get_height()

            const ratio = Math.min(1, THUMBNAIL_SIZE / originalWidth, THUMBNAIL_SIZE / originalHeight)
            const width = Math.round(originalWidth * ratio)
            const height = Math.round(originalHeight * ratio)

            const photonOutput = resize(photonInput, width, height, 5)
            const bytes = photonOutput.get_bytes_webp()

            photonInput.free()
            photonOutput.free()

            return new Blob([bytes], { type: 'image/webp' })
        } catch {
            return null
        }
    }

    public async upload(files: File[]) {
        const images: File[] = []
        const uploadedImages: Image[] = [] 
        const errorImages: ErrorImage[] = []

        //Validates image files with max 5Mb and 1920
        for (const file of files) {
            if (VALID_TYPES.includes(file.type) === false) {
                errorImages.push(errImg(file, 'Invalid file type'))
                continue
            }

            if (file.size > MAX_FILE_SIZE) {
                errorImages.push(errImg(file, 'File size exceeds the 5Mb limit' ))
                continue
            }

            const dimensions = await imageDimensionsFromStream(file.stream())

            if (dimensions === undefined) {
                errorImages.push(errImg(file, 'Unable to read image data'))
                continue
            }

            const totalPixels = dimensions.width * dimensions.height

            if (totalPixels > MAX_IMAGE_PIXELS) {
                errorImages.push(errImg(file, `Image dimensions exceed the ${MAX_IMAGE_PIXELS}px limit`))
                continue
            }

            images.push(file)
        }

        //If there are no valid images left, return
        if (images.length === 0) { return { uploadedImages, errorImages }}

        if (images.length > 5) { throw new BadRequestError('Maximum of 5 images per upload') }

        //Proceed with upload and storage
        for (const image of images) {
            const data = {
                key: crypto.randomUUID(), 
                name: image.name.substring(0, image.name.lastIndexOf('.')),
                extension: image.name.substring(image.name.lastIndexOf('.'))
            }

            const thumbnail = await this.generateThumbnail(image)

            if (thumbnail === null) {
                errorImages.push(errImg(image, 'Unable to generate thumbnail'))
                continue
            }

            const result = await this.repository.upload(image, thumbnail, data)

            if (result === null) {
                errorImages.push(errImg(image, 'Unable to store image, please try again'))
                continue
            }

            uploadedImages.push(Image.fromDatabase(result))
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