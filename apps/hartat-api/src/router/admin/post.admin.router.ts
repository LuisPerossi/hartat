import { Hono } from "hono";
import { HonoEnv } from "../../types/hono";

const router = new Hono<HonoEnv>()

router.post('/', (c) => {
    return c.var.dependencies.postController.create(c)
})

router.get('/', (c) => {
    return c.var.dependencies.postController.getAll(c)
})

router.get('/:id', (c) => {
    return c.var.dependencies.postController.getById(c)
})

router.patch('/:id', (c) => {
    return c.var.dependencies.postController.update(c)
})

router.delete('/:id', (c) => {
    return c.var.dependencies.postController.delete(c)
})

export default router
