import { API_URL } from "@/config/env";
import type { MessageOnlyResponse } from "@hartat/types/shared";

interface DeleteImageProps {
    id: number
}

export async function deleteImage({ id }: DeleteImageProps) {
    const res = await fetch(`${API_URL}/admin/images/id/${id}`, { method: 'DELETE' })

    if (res.ok === false) { 
        const body = await res.json() as MessageOnlyResponse
        throw new Error(body.message) 
    }
}