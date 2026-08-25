import { Hono } from 'hono'
import { HonoEnv } from './types/hono'
import { dependencies } from './dependencies'
import { ContentfulError } from './error/ContentfulError'
import postRouter from './router/post.router'

const app = new Hono<HonoEnv>()

//Dependencies middleware
app.use(dependencies)

//Default route
app.get('/', (c) => {
  return c.text('Hello Hono!')
})

//Posts route
app.route('/posts', postRouter)

//Error handling
app.onError((err, c) => {
  if (err instanceof ContentfulError)
    return c.json({ error: err.message, data: err.data }, err.status)

  return c.json({ error: "Internal server error" }, 500)
})

export default app