import { Hono } from "hono";
import { HonoEnv } from "../../types/hono";

const router = new Hono<HonoEnv>()

router.get('/:key', (c) => {
    return c.var.dependencies.imageController.getByKey(c)
})

router.get('/', (c) => {
    return c.var.dependencies.imageController.getAll(c)
})
export default router