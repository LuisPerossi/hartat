import { CreateImage, GetImages, UpdateImage } from "../schema/image.schema";

export type ImageRow = {
    readonly id: number,
    readonly key: string,
    readonly name: string,
    readonly extension: string
    readonly uploaded_at: string
}

export class ImageRepository {
    constructor(private readonly db: D1Database, private readonly bucket: R2Bucket) {}

    public async upload(image: File, thumbnail: Blob, data: CreateImage): Promise<ImageRow | null> {
        try {
            await this.bucket.put(data.key, image)
            await this.bucket.put(data.key + '_preview', thumbnail)

            const result = await this.db.prepare(`
                INSERT INTO
                images (key, name, extension)
                VALUES (?, ?, ?)
                RETURNING id, key, name, extension, uploaded_at
            `)
            .bind(data.key, data.name, data.extension)
            .first<ImageRow>()

            if (!result) { throw new Error('Unable to upload image') }

            return { ...result } 
        } catch {
            await this.bucket.delete(data.key)
            await this.bucket.delete(data.key + '_preview')
            return null
        }
    }

    public async getByKey(key: string) {
        return await this.bucket.get(key)
    }

    public async getAll(getImages: GetImages) {
        const { page, limit, search, sort, order } = getImages
        
        const offset = (page - 1) * limit
        const sortColumn = { name: 'name', date: 'uploaded_at' }[sort]

        const { results } = await this.db
            .prepare(`
                SELECT id, key, name, extension, uploaded_at
                FROM images
                WHERE name LIKE ?
                ORDER BY ${sortColumn} ${order}
                LIMIT ? OFFSET ?
            `)
            .bind(search ? `%${search}%` : '%', limit, offset)
            .all<ImageRow>()

        return results
    }

    public async getById(id: number) {
        const result = await this.db
            .prepare(`
                SELECT id, key, name, extension, uploaded_at 
                FROM images
                WHERE id = ?
            `)
            .bind(id)
            .first<ImageRow>()

        return result
    }

    public async update(id: number, updateImage: UpdateImage) {
        const result = await this.db
            .prepare(`
                UPDATE images
                SET name = ?
                WHERE id = ?
                RETURNING id, key, name, extension, uploaded_at    
            `)
            .bind(updateImage.name, id)
            .first<ImageRow>()

        return result
    }

    public async delete(id: number) {
        const result = await this.db
            .prepare(`
                DELETE FROM images
                WHERE id = ?
                RETURNING key
            `)
            .bind(id)
            .first<{ key: string }>()

        if (!result) { return false }

        await this.bucket.delete(result.key)
        await this.bucket.delete(result.key + '_preview')

        return true
    }

    public async count(search: string | undefined) {
        const result = await this.db
            .prepare(`
                SELECT COUNT(*) AS count
                FROM images   
                WHERE name LIKE ?
            `)
            .bind(search ? `%${search}%` : '%')
            .first<{ count: number }>()

        return result?.count ?? 0
    }
}