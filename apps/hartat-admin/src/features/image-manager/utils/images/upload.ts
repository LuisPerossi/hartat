import { API_URL } from "@/config/env"
import type { Image, FailedImage, PostImagesResponse } from "@hartat/types/images"
import { convertImage } from "./process"

interface UploadImagesProps {
    files: File[]
}

const ALLOWED_TYPES = [ 'image/png', 'image/jpeg', 'image/webp' ]
const UPLOAD_BATCH_SIZE = 5

export async function uploadImages({ files }: UploadImagesProps) {
    const imageFiles: File[] = []
    const uploadedImages: Image[] = []
    const failedImages: FailedImage[] = []

    //Validating the image files
    for (const f of files) {
        if (ALLOWED_TYPES.includes(f.type)) { imageFiles.push(f) }
        else { failedImages.push(createFailedImage(f, 'Invalid file type')) }
    }

    //Returns if there is no valid images
    if (imageFiles.length === 0) { 
        console.error('No valid files selected')
        console.error(failedImages)
        return null
    }

    //Uploading images per batch
    for (let i = 0; i < imageFiles.length; i += UPLOAD_BATCH_SIZE) {
        const batch = imageFiles.slice(i, i + UPLOAD_BATCH_SIZE)
        const { form, convertedImages } = await convertBatch(batch, failedImages) 

        if (convertedImages.length === 0) {
            console.error('Unable to convert batch')
            console.error(batch)
            continue
        }

        try {
            const res = await fetch(`${API_URL}/admin/images`, { method: 'POST', body: form })
            const body = await res.json() as PostImagesResponse

            if (body.data === undefined) { throw new Error(body.message) }

            failedImages.push(...body.data.failedImages)
            uploadedImages.push(...body.data.uploadedImages)
        } catch (err) {
            console.error(err)
            
            for (const image of convertedImages) {
                failedImages.push(createFailedImage(image, 'Unable to upload image'))
            }
        }
    }

    return { uploadedImages, failedImages }
}

function createFailedImage(file: File, cause: string): FailedImage {
    return { name: file.name, type: file.type, size: file.size, cause }
}

async function convertBatch(batch: File[], failedImages: FailedImage[]) {
    const form = new FormData()
    const convertedImages: File[] = []

    for (const image of batch) {
        try {
            const convertedImage = await convertImage(image)
            form.append('image', convertedImage)
            convertedImages.push(convertedImage)
        } catch(err) {
            console.error(err)
            failedImages.push(createFailedImage(image, 'Unable to convert image'))
        }
    }

    return { form, convertedImages }
}