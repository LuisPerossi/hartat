import { Hono } from "hono";
import { HonoEnv } from "../../types/hono";

const router = new Hono<HonoEnv>()

router.post('/', (c) => {
    return c.var.dependencies.eventController.create(c)
})

router.get('/', (c) => {
    return c.var.dependencies.eventController.getAll(c)
})

router.get('/:id', (c) => {
    return c.var.dependencies.eventController.getById(c)
})

router.patch('/:id', (c) => {
    return c.var.dependencies.eventController.update(c)
})

router.delete('/:id', (c) => {
    return c.var.dependencies.eventController.delete(c)
})

export default router
