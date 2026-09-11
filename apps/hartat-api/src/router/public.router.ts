import { Hono } from "hono";
import { HonoEnv } from "../types/hono";
import categoryRouter from "./public/category.public.router"
import imageRouter from "./public/image.public.router"

const router = new Hono<HonoEnv>()

router.route('/categories', categoryRouter)

router.route('/images', imageRouter)

router.get('/', (c) => {
    return c.text('Hello public route!')
})

export default router