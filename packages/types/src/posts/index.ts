export * from './api'

export interface PostCategory {
    id: number
    name: string
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
    content: string
    createdAt: string
    updatedAt: string
    categoryId: number | null
    imageId: number | null
    category?: PostCategory | null
    image?: PostImage | null
}
