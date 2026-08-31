import { ImageRepository } from "../repository/ImageRepository";

export class ImageService {
    constructor(private readonly repository: ImageRepository) {}
}