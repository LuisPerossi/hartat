import { Hono } from "hono";
import { HonoEnv } from "../types/hono";
import { zValidator } from '@hono/zod-validator'
import { createPostSchema } from "../schema/post.schema";

const router = new Hono<HonoEnv>()

router.post('/', zValidator('json', createPostSchema), (c) => {
    const validated = c.req.valid('json')
    console.log(validated)

    return c.text("Hello World!")
})


export default router