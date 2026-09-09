import { Hono } from 'hono'
import { HonoEnv } from './types/hono'
import { dependencies } from './dependencies'
import { ContentfulError } from './error/ContentfulError'
import publicRouter from './router/public.router'
import adminRouter from './router/admin.router'
import { NotFoundError } from './error/NotFoundError'
import { BadRequestError } from './error/BadRequestError'
import { ValidationError } from './error/ValidationError'

const app = new Hono<HonoEnv>()

//Dependencies middleware
app.use(dependencies)

//Admin route
app.route('/admin', adminRouter)

//Public route
app.route('/', publicRouter)

//Error handling
app.onError((err, c) => {
  if (err instanceof BadRequestError)
    return c.json({ error: err.message }, 400 )

  if (err instanceof ValidationError)
    return c.json({ error: err.message, data: err.data }, 400)
  
  if (err instanceof ContentfulError)
    return c.json({ error: err.message, data: err.data }, err.status)

  if (err instanceof NotFoundError)
    return c.json({ error: err.message }, 404)

  console.log(err.message)
  return c.json({ error: "Internal server error" }, 500)
})

export default app