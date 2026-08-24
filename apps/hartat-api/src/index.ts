import { Hono } from 'hono'
import { ContentfulError } from './error/ContentfulError'
import { PostController } from './controller/PostController'
import { createDependencies } from './setup/dependencies'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/test', () => {
  throw new ContentfulError("This is a custom error.", 400, { fatal: true })
})

app.post('/posts', (c) => {
  const { postController } = createDependencies(c.env.db)
  return postController.create(c)
})

app.get('/posts/:id', (c) => {
  const { postController } = createDependencies(c.env.db)
  return postController.getById(c)
})

app.put('/posts', (c) => {
  const { postController } = createDependencies(c.env.db)
  return postController.update(c)
})

app.delete('/posts/:id', (c) => {
  const { postController } = createDependencies(c.env.db)
  return postController.delete(c)
})

app.onError((err, c) => {
  if (err instanceof ContentfulError)
    return c.json({ error: err.message, data: err.data }, err.status)

  return c.json({ error: "Internal server error" }, 500)
})

export default app