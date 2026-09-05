import { Hono } from "hono";
import { HonoEnv } from "../types/hono";
import categoryRouter from "./admin/category.admin.router"

const router = new Hono<HonoEnv>()

router.route('/categories', categoryRouter)

router.get('/', (c) => {
    return c.text('Hello admin route!')
})

export default router