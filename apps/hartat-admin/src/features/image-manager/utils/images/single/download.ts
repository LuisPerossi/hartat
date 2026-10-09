import type { MessageOnlyResponse } from "@hartat/types/shared";

interface DownloadImageProps {
    imageUrl: string
}

export async function downloadImage({ imageUrl }: DownloadImageProps ) {
    const res = await fetch(imageUrl)

    if (res.ok === false) {
        const body = await res.json() as MessageOnlyResponse
        throw new Error(body.message)
    }

    return await res.blob()
}