import type { BannerAlignment } from "@hartat/types/posts"

export function slugify(text: string): string {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
}

export function sanitizeSlugInput(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/-{2,}/g, "-")
}

export function formatDateTime(dateStr?: string): string {
    if (!dateStr) return "-"
    try {
        return new Date(dateStr).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    } catch {
        return dateStr
    }
}

export function isPostModified(createdAt?: string, updatedAt?: string): boolean {
    if (!createdAt || !updatedAt) return false
    const created = new Date(createdAt).getTime()
    const updated = new Date(updatedAt).getTime()
    if (isNaN(created) || isNaN(updated)) return false
    return updated - created >= 1000
}

export function getBannerAlignmentClass(alignment?: BannerAlignment): string {
    switch (alignment) {
        case "top":
            return "object-top"
        case "bottom":
            return "object-bottom"
        default:
            return "object-center"
    }
}
