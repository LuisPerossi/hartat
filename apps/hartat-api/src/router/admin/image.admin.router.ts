import { Hono } from "hono";
import { HonoEnv } from "../../types/hono";

const router = new Hono<HonoEnv>()

//General routes
router.post('/', (c) => {
    return c.var.dependencies.imageController.upload(c)
})

router.get('/:key', (c) => {
    return c.var.dependencies.imageController.getByKey(c)
})

router.get('/', (c) => {
    return c.var.dependencies.imageController.getAll(c)
})

//Operation routes (using :id)
router.get('/id/:id', (c) => {
    return c.var.dependencies.imageController.getById(c)
})

router.patch('/id/:id', (c) => {
    return c.var.dependencies.imageController.update(c)
})

router.delete('/id/:id', (c) => {
    return c.var.dependencies.imageController.delete(c)
})

export default router