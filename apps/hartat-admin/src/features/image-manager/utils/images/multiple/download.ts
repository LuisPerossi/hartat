import { API_URL } from "@/config/env"
import type { Image } from "@hartat/types/images"
import type { MessageOnlyResponse } from "@hartat/types/shared"
import JSZip from "jszip"

interface DownloadSelectedImagesProps {
    selectedImages: Map<string, Image>
}

export async function downloadSelectedImages({ selectedImages }: DownloadSelectedImagesProps) {
    let errorCount = 0
    const zip = new JSZip()

    for (const [, image] of selectedImages) {
        const fileName = `${image.name}${image.extension}`
        const imageUrl = `${API_URL}/admin/images/${image.key}`

        try {
            const res = await fetch(imageUrl)

            if (res.ok === false) {
                console.error(`Unable to download ${fileName}`)
                const body = await res.json() as MessageOnlyResponse
                throw new Error(body.message)
            }

            const blob = await res.blob()
            zip.file(fileName, blob)
        } catch(err) {
            console.error(err)
            errorCount++
        }
    }
    
    const content = await zip.generateAsync({ type: 'blob' })
    return { errorCount, content }
}