export class ImageRepository {
    constructor(private readonly db: D1Database, private readonly bucket: R2Bucket) {}
}