import { createDependencies } from "../dependencies"

export type AppBindings = CloudflareBindings & {
    CORS_ORIGINS?: string
    ADMIN_API_SECRET?: string
    CF_ACCESS_TEAM_DOMAIN?: string
    CF_ACCESS_AUD?: string
}

export type HonoEnv = {
    Bindings: AppBindings,
    Variables: {
        dependencies: ReturnType<typeof createDependencies>
    }
}