import { PostRow } from "../repository/PostRepository"

export type BannerAlignment = 'top' | 'center' | 'bottom'

export type PostCategory = {
    id: number
    name: string
    color?: string | null
}

export type PostImage = {
    id: number
    key: string
    name: string
    extension: string
}

export class Post {
    constructor(
        public readonly id: number,
        public title: string,
        public slug: string,
        public content: string,
        public bannerAlignment: BannerAlignment,
        private readonly createdAt: string,
        private readonly updatedAt: string,
        public readonly categoryId: number | null,
        public readonly imageId: number | null,
        public readonly category?: PostCategory | null,
        public readonly image?: PostImage | null
    ) {}

    private convertDate(date: string) {
        return new Date(date?.replace(' ', 'T') + 'Z')
    }

    public static fromDatabase(data: PostRow) {
        const category = data.category_id && data.category_name ? {
            id: data.category_id,
            name: data.category_name,
            color: data.category_color ?? null
        } : null

        const image = data.image_id && data.image_key ? {
            id: data.image_id,
            key: data.image_key,
            name: data.image_name ?? '',
            extension: data.image_extension ?? ''
        } : null

        const alignment = data.banner_alignment === 'top' || data.banner_alignment === 'bottom'
            ? data.banner_alignment
            : 'center'

        return new Post(
            data.id,
            data.title,
            data.slug ?? '',
            data.content,
            alignment,
            data.created_at,
            data.updated_at,
            data.category_id ?? null,
            data.image_id ?? null,
            category,
            image
        )
    }

    public toJSON() {
        return {
            id: this.id,
            title: this.title,
            slug: this.slug,
            content: this.content,
            bannerAlignment: this.bannerAlignment,
            createdAt: this.convertDate(this.createdAt),
            updatedAt: this.convertDate(this.updatedAt),
            categoryId: this.categoryId,
            imageId: this.imageId,
            category: this.category,
            image: this.image
        }
    }
}
