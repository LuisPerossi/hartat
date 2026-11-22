export * from './api'

export const MAX_CATEGORIES = 20

export interface Category {
    id: number,
    name: string,
    color?: string | null,
    postCount?: number
}
