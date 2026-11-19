export * from './api'

export const MAX_CATEGORIES = 20

export interface Category {
    id: number,
    name: string,
    postCount?: number
}
