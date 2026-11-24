const MAX_IMAGE_SIZE = 1920
const THUMBNAIL_SIZE = 600
const IMAGE_QUALITY = 0.8
const FALLBACK_IMAGE_QUALITY = 0.65
const THUMBNAIL_QUALITY = 0.78
const MAX_CONVERTED_BYTES = 5 * 1024 * 1024 // 5MB

export const MAX_RAW_FILE_SIZE = 50 * 1024 * 1024 // 50MB

const NATIVE_MIME_TYPES = new Set([
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/avif',
    'image/gif',
    'image/bmp',
])

const HEIC_MIME_TYPES = new Set([
    'image/heic',
    'image/heif',
    'image/heic-sequence',
    'image/heif-sequence',
])

const NATIVE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.bmp'])
const HEIC_EXTENSIONS = new Set(['.heic', '.heif'])

export interface ProcessedImagePair {
    image: File
    thumbnail: File
}

function getFileExtension(name: string): string {
    const dotIndex = name.lastIndexOf('.')
    return dotIndex >= 0 ? name.slice(dotIndex).toLowerCase() : ''
}

function getBaseFileName(name: string): string {
    const dotIndex = name.lastIndexOf('.')
    return dotIndex > 0 ? name.slice(0, dotIndex) : name
}

export function isHeicFile(file: File): boolean {
    if (HEIC_MIME_TYPES.has(file.type.toLowerCase())) {
        return true
    }
    return HEIC_EXTENSIONS.has(getFileExtension(file.name))
}

export function isSupportedImageFile(file: File): boolean {
    const mime = file.type.toLowerCase()
    if (NATIVE_MIME_TYPES.has(mime) || isHeicFile(file)) {
        return true
    }
    // Some browsers/OSes report an empty MIME type for certain image formats
    if (!mime) {
        return NATIVE_EXTENSIONS.has(getFileExtension(file.name))
    }
    return false
}

async function decodeImageBitmap(file: File): Promise<ImageBitmap> {
    if (!isHeicFile(file)) {
        return await createImageBitmap(file)
    }

    // Try native decoding first (supported in Safari)
    try {
        return await createImageBitmap(file)
    } catch {
        // Lazy-load HEIC decoder only when a HEIC/HEIF file actually needs conversion
        const { heicTo } = await import('heic-to')
        const convertedBlob = await heicTo({
            blob: file,
            type: 'image/jpeg',
            quality: 0.92,
        })
        return await createImageBitmap(convertedBlob)
    }
}

async function renderResizedWebp(
    bitmap: ImageBitmap,
    maxDimension: number,
    quality: number
): Promise<Blob> {
    const ratio = Math.min(maxDimension / bitmap.width, maxDimension / bitmap.height, 1)
    const width = Math.max(1, Math.round(bitmap.width * ratio))
    const height = Math.max(1, Math.round(bitmap.height * ratio))

    const { canvas, ctx } = createCanvas(width, height)
    ctx.drawImage(bitmap, 0, 0, width, height)

    return await canvasToBlob(canvas, quality)
}

// Converts an image to a 1920px max WebP and a 600px max WebP thumbnail in the browser
export async function processImage(file: File): Promise<ProcessedImagePair> {
    const bitmap = await decodeImageBitmap(file)

    try {
        let imageBlob = await renderResizedWebp(bitmap, MAX_IMAGE_SIZE, IMAGE_QUALITY)

        // If the converted WebP still exceeds 5MB, retry once with lower quality
        if (imageBlob.size > MAX_CONVERTED_BYTES) {
            imageBlob = await renderResizedWebp(bitmap, MAX_IMAGE_SIZE, FALLBACK_IMAGE_QUALITY)
        }

        if (imageBlob.size > MAX_CONVERTED_BYTES) {
            throw new Error('IMAGE_TOO_LARGE_AFTER_CONVERSION')
        }

        const thumbnailBlob = await renderResizedWebp(bitmap, THUMBNAIL_SIZE, THUMBNAIL_QUALITY)

        const baseName = getBaseFileName(file.name)
        const image = new File([imageBlob], `${baseName}.webp`, { type: 'image/webp' })
        const thumbnail = new File([thumbnailBlob], `${baseName}_thumbnail.webp`, { type: 'image/webp' })

        return { image, thumbnail }
    } finally {
        bitmap.close()
    }
}

function createCanvas(width: number, height: number) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (ctx === null) { throw new Error('Unable to create 2D context') }

    return { canvas, ctx }
}

function canvasToBlob(canvas: HTMLCanvasElement, quality = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) { resolve(blob) }
            else { reject(new Error('Unable to generate blob')) }
        }, 'image/webp', quality)
    })
}
