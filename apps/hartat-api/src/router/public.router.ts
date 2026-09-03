import { Hono } from "hono";
import { HonoEnv } from "../types/hono";

const router = new Hono<HonoEnv>()

router.get('/', (c) => {
    return c.text('Hello public route!')
})

export default router