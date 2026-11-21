import { Hono } from "hono";
import { HonoEnv } from "../../types/hono";

const router = new Hono<HonoEnv>()

router.get('/', (c) => {
    return c.var.dependencies.postController.getAll(c)
})

router.get('/slug/:slug', (c) => {
    return c.var.dependencies.postController.getBySlug(c)
})

router.get('/:id', (c) => {
    return c.var.dependencies.postController.getById(c)
})

export default router
