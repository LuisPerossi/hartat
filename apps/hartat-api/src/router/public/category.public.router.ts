import { Hono } from "hono";
import { HonoEnv } from "../../types/hono";

const router = new Hono<HonoEnv>()

router.get('/', (c) => {
    return c.var.dependencies.categoryController.getAll(c)
})

router.get('/:id', (c) => {
    return c.var.dependencies.categoryController.getById(c)
})

export default router