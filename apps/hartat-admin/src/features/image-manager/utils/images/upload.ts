import { API_URL } from "@/config/env"
import type { Image, FailedImage, PostImagesResponse } from "@hartat/types/images"
import { isSupportedImageFile, MAX_RAW_FILE_SIZE, processImage } from "./process"

interface UploadImagesProps {
    files: File[]
}

export interface UploadImagesResult {
    uploadedImages: Image[]
    failedImages: FailedImage[]
}

export async function uploadImages({ files }: UploadImagesProps): Promise<UploadImagesResult> {
    const validFiles: File[] = []
    const uploadedImages: Image[] = []
    const failedImages: FailedImage[] = []

    for (const file of files) {
        if (!isSupportedImageFile(file)) {
            failedImages.push(createFailedImage(file, 'Formato não suportado (use PNG, JPG, WebP, AVIF, GIF, BMP ou HEIC)'))
            continue
        }

        if (file.size > MAX_RAW_FILE_SIZE) {
            failedImages.push(createFailedImage(file, 'Arquivo muito grande (limite de 50 MB para envio)'))
            continue
        }

        validFiles.push(file)
    }

    if (validFiles.length === 0) {
        return { uploadedImages, failedImages }
    }

    // Process and upload one image pair (full + thumbnail) per request to keep memory and Worker CPU low
    for (const originalFile of validFiles) {
        let processed: { image: File; thumbnail: File }

        try {
            processed = await processImage(originalFile)
        } catch (err) {
            console.error(err)
            const cause = err instanceof Error && err.message === 'IMAGE_TOO_LARGE_AFTER_CONVERSION'
                ? 'Imagem excedeu o limite de 5 MB mesmo após otimização'
                : 'Não foi possível ler ou converter a imagem'
            failedImages.push(createFailedImage(originalFile, cause))
            continue
        }

        const form = new FormData()
        form.append('image', processed.image)
        form.append('thumbnail', processed.thumbnail)

        try {
            const res = await fetch(`${API_URL}/admin/images`, { method: 'POST', body: form })
            const contentType = res.headers.get('content-type') ?? ''

            if (!contentType.includes('application/json')) {
                failedImages.push(createFailedImage(originalFile, getHttpStatusErrorMessage(res.status)))
                continue
            }

            const body = await res.json() as PostImagesResponse

            if (body.data === undefined) {
                failedImages.push(createFailedImage(originalFile, translateServerError(body.message, res.status)))
                continue
            }

            for (const failed of body.data.failedImages) {
                failedImages.push({
                    ...failed,
                    name: originalFile.name,
                    cause: translateServerError(failed.cause, res.status),
                })
            }

            uploadedImages.push(...body.data.uploadedImages)
        } catch (err) {
            console.error(err)
            failedImages.push(createFailedImage(originalFile, 'Erro de conexão ao enviar a imagem'))
        }
    }

    return { uploadedImages, failedImages }
}

function createFailedImage(file: File, cause: string): FailedImage {
    return { name: file.name, type: file.type, size: file.size, cause }
}

function getHttpStatusErrorMessage(status: number): string {
    if (status === 413) return 'Arquivo excedeu o limite de tamanho aceito pelo servidor'
    if (status === 503 || status === 504) return 'Servidor temporariamente indisponível ou sobrecarregado'
    if (status >= 500) return 'Erro interno no servidor ao salvar a imagem'
    return `Falha no envio (HTTP ${status})`
}

function translateServerError(message: string | undefined, status: number): string {
    if (!message) return getHttpStatusErrorMessage(status)

    const normalized = message.toLowerCase()
    if (normalized.includes('invalid') && normalized.includes('type')) {
        return 'Formato de imagem inválido'
    }
    if (normalized.includes('size exceeds')) {
        return 'Imagem excedeu o limite de tamanho do servidor (5 MB)'
    }
    if (normalized.includes('dimensions exceed')) {
        return 'Dimensões da imagem excederam o limite permitido'
    }
    if (normalized.includes('unable to read')) {
        return 'Arquivo de imagem inválido ou corrompido'
    }
    if (normalized.includes('unable to store')) {
        return 'Não foi possível salvar a imagem no servidor, tente novamente'
    }
    if (normalized.includes('thumbnail')) {
        return 'Erro ao validar a miniatura da imagem'
    }

    return message
}
