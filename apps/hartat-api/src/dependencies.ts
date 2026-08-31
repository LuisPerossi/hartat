import { HonoEnv } from "./types/hono"
import { Context, Next } from "hono"

import { PostController } from "./controller/PostController"
import { PostService } from "./service/PostService"
import { PostRepository } from "./repository/PostRepository"

import { CategoryController } from "./controller/CategoryController"
import { CategoryService } from "./service/CategoryService"
import { CategoryRepository } from "./repository/CategoryRepository"

import { EventController } from "./controller/EventController"
import { EventService } from "./service/EventService"
import { EventRepository } from "./repository/EventRepository"

import { ImageController } from "./controller/ImageController"
import { ImageService } from "./service/ImageService"
import { ImageRepository } from "./repository/ImageRepository"

export function createDependencies(db: D1Database, bucket: R2Bucket) {
    //Post dependencies
    const postRepository = new PostRepository(db)
    const postService = new PostService(postRepository)
    const postController = new PostController(postService)

    //Category dependencies
    const categoryRepository = new CategoryRepository(db)
    const categoryService = new CategoryService(categoryRepository)
    const categoryController = new CategoryController(categoryService)

    //Event dependencies
    const eventRepository = new EventRepository(db)
    const eventService = new EventService(eventRepository)
    const eventController = new EventController(eventService)

    //Image dependencies
    const imageRepository = new ImageRepository(db, bucket)
    const imageService = new ImageService(imageRepository)
    const imageController = new ImageController(imageService)

    return { postController, categoryController, eventController, imageController }
}

export async function dependencies(c: Context<HonoEnv>, next: Next) {
    c.set('dependencies', createDependencies(c.env.db, c.env.bucket))
    return await next()
}