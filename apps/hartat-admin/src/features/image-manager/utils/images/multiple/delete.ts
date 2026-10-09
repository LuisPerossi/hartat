import { API_URL } from "@/config/env";
import type { Image } from "@hartat/types/images";
import type { MessageOnlyResponse } from "@hartat/types/shared";

interface DeleteSelectedImagesProps {
    selectedImages: Map<string, Image>
}

export async function deleteSelectedImages({ selectedImages }: DeleteSelectedImagesProps) {
    let errorCount = 0

    for (const [, image] of selectedImages) {
        try {
            const res = await fetch(`${API_URL}/admin/images/id/${image.id}`, { method: 'DELETE' })

            if (res.ok === false) {
                const body = await res.json() as MessageOnlyResponse
                throw new Error(body.message)
            }

        } catch(err) {
            console.error(err)
            errorCount++
        }
    }

    return { errorCount }
}