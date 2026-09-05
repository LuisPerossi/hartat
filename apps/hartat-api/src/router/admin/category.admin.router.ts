import { Hono } from "hono";
import { HonoEnv } from "../../types/hono";

const router = new Hono<HonoEnv>()

router.post('/', c => {
    return c.var.dependencies.categoryController.create(c)
})

router.get('/', (c) => {
    return c.var.dependencies.categoryController.getAll(c)
})

router.get('/:id', (c) => {
    return c.var.dependencies.categoryController.getById(c)
})

router.patch('/:id', (c) => {
    return c.var.dependencies.categoryController.update(c)
})

router.delete('/:id', (c) => {
    return c.var.dependencies.categoryController.delete(c)
})

export default router