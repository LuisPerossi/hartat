import { Hono } from 'hono'
import { HonoEnv } from './types/hono'
import { dependencies } from './dependencies'
import { ContentfulError } from './error/ContentfulError'
import publicRouter from './router/public.router'
import adminRouter from './router/admin.router'
import { NotFoundError } from './error/NotFoundError'
import { BadRequestError } from './error/BadRequestError'
import { ValidationError } from './error/ValidationError'
import { adminAuth } from './middleware/adminAuth'
import { cors } from 'hono/cors'

const app = new Hono<HonoEnv>()

// CORS configured via wrangler.jsonc vars (CORS_ORIGINS)
app.use(cors({
  origin: (origin, c) => {
    const rawOrigins: string = c.env.CORS_ORIGINS ?? ''
    const allowedOrigins = rawOrigins
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    return allowedOrigins.includes(origin) ? origin : ''
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}))

//Dependencies middleware
app.use(dependencies)

//Admin route (protected by server-side secret + optional Cloudflare Access JWT)
app.use('/admin/*', adminAuth)
app.route('/admin', adminRouter)

//Public route
app.route('/', publicRouter)

//Error handling
app.onError((err, c) => {
  if (err instanceof BadRequestError)
    return c.json({ message: err.message }, 400 )

  if (err instanceof ValidationError)
    return c.json({ message: err.message, data: err.data }, 400)
  
  if (err instanceof ContentfulError)
    return c.json({ message: err.message, data: err.data }, err.status)

  if (err instanceof NotFoundError)
    return c.json({ message: err.message }, 404)

  console.log(err.message)
  return c.json({ message: "Internal server error" }, 500)
})

export default app