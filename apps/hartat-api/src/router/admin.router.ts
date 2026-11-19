import { Hono } from "hono";
import { HonoEnv } from "../types/hono";
import categoryRouter from "./admin/category.admin.router"
import imageRouter from "./admin/image.admin.router"
import postRouter from "./admin/post.admin.router"

const router = new Hono<HonoEnv>()

router.route('/categories', categoryRouter)

router.route('/images', imageRouter)

router.route('/posts', postRouter)

router.get('/', (c) => {
    return c.text('Hello admin route!')
})

export default router