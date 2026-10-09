import { API_URL } from "@/config/env";
import type { MessageOnlyResponse } from "@hartat/types/shared";

interface RenameImageProps {
    id: number,
    name: string
}

export async function renameImage({ id, name }: RenameImageProps) {
    const res = await fetch(
        `${API_URL}/admin/images/id/${id}`, 
        { method: 'PATCH', body: JSON.stringify({name}) }
    )
    
    if (res.ok === false) { 
        const body = await res.json() as MessageOnlyResponse
        throw new Error(body.message) 
    }
}