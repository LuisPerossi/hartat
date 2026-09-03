import { Hono } from 'hono'
import { HonoEnv } from './types/hono'
import { dependencies } from './dependencies'
import { ContentfulError } from './error/ContentfulError'
import publicRouter from './router/public.router'
import adminRouter from './router/admin.router'

const app = new Hono<HonoEnv>()

//Dependencies middleware
app.use(dependencies)

//Admin route
app.route('/admin', adminRouter)

//Public route
app.route('/', publicRouter)

//Error handling
app.onError((err, c) => {
  if (err instanceof ContentfulError)
    return c.json({ error: err.message, data: err.data }, err.status)

  return c.json({ error: "Internal server error" }, 500)
})

export default app