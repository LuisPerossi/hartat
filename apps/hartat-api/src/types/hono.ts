import { createDependencies } from "../dependencies"

export type HonoEnv = {
    Bindings: CloudflareBindings,
    Variables: {
        dependencies: ReturnType<typeof createDependencies>
    }
}