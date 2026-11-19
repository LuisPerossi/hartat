export interface SortOrder {
    sort: 'date' | 'title'
    order: 'asc' | 'desc'
}

export interface PostFormData {
    title: string
    content: string
    categoryId: number | null
    imageId: number | null
}
