import { Hono } from "hono";
import { HonoEnv } from "../types/hono";

const router = new Hono<HonoEnv>()

router.post('/', (c) => {
    return c.var.dependencies.postController.create(c)
})


export default router