import { Context } from "hono";
import { ImageService } from "../service/ImageService";
import { BadRequestError } from "../error/BadRequestError";
import { idParser } from "../helper/idParser";
import { jsonParser } from "../helper/jsonParser";
import { validate } from "../helper/validate";
import { getImagesSchema, updateImageSchema } from "../schema/image.schema";

export class ImageController {
    constructor(private readonly service: ImageService) {}

    public async upload(c: Context) {
        const body = await c.req.parseBody({ all: true })

        //Filtering image files
        const images = (Array.isArray(body.image) ? body.image : [ body.image ])
            .filter((v): v is File => v instanceof File && v.type.startsWith('image/'))
        
        if (images.length === 0) { throw new BadRequestError('Image files not provided!') }

        if (images.length > 20) { throw new BadRequestError('Maximum of 20 images per upload reached') }

        const { uploadedImages, errorImages } = await this.service.upload(images)

        if (uploadedImages.length === 0) {
            return c.json({ message: 'Unable to upload file(s)', data: { errorImages } }, 500)
        }

        if (errorImages.length > 0) {
            return c.json({ message: 'Partially uploaded files', data: { uploadedImages, errorImages } }, 207)
        }

        return c.json({ message: 'Uploaded file(s)', data: { uploadedImages } }, 201)
    }

    public async getByKey(c: Context) {
        const key = c.req.param('key')
        const preview = c.req.query('preview')
        const previewMode = (preview !== undefined)

        if (!key) { throw new BadRequestError('Image key not provided') }

        const image = await this.service.getByKey(key, previewMode)

        return c.body(image.body)
    }

    public async getAll(c: Context) {
        const query = c.req.query()

        const getImages = validate(getImagesSchema, query)

        const { images, pagination } = await this.service.getAll(getImages)

        return c.json({ message: 'Retrieved images', data: { images, pagination } }, 200)
    }

    public async getById(c: Context) {
        const id = idParser(c.req)

        const image = await this.service.getById(id)

        return c.json({ message: 'Retrieved image', data: { image } }, 200)
    }

    public async update(c: Context) {
        const id = idParser(c.req)
        const body = await jsonParser(c.req)

        const updateImage = validate(updateImageSchema, body)

        const image = await this.service.update(id, updateImage)

        return c.json({ message: 'Updated image', data: { image } }, 200)
    }

    public async delete(c: Context) {
        const id = idParser(c.req)

        await this.service.delete(id)

        return c.json({ message: 'Deleted image' }, 200)
    }
}
