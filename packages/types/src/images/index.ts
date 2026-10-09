export * from './api.ts'

export interface Image {
    id: number,
    key: string,
    name: string,
    extension: string,
    uploadedAt: string
}

export interface FailedImage {
    name: string,
    type: string,
    size: number,
    cause: string    
}