export * from './api'

export type BannerAlignment = 'top' | 'center' | 'bottom'

export interface PostCategory {
    id: number
    name: string
    color?: string | null
}

export interface PostImage {
    id: number
    key: string
    name: string
    extension: string
}

export interface Post {
    id: number
    title: string
    slug: string
    content: string
    bannerAlignment: BannerAlignment
    createdAt: string
    updatedAt: string
    categoryId: number | null
    imageId: number | null
    category?: PostCategory | null
    image?: PostImage | null
}
