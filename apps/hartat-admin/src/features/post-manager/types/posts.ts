import type { BannerAlignment } from "@hartat/types/posts"

export interface SortOrder {
    sort: 'date' | 'updated' | 'title'
    order: 'asc' | 'desc'
}

export interface PostFormData {
    title: string
    slug: string
    content: string
    bannerAlignment: BannerAlignment
    categoryId: number | null
    imageId: number | null
}
