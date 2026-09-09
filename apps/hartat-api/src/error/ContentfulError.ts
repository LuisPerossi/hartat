import { ContentfulStatusCode } from "hono/utils/http-status";

export class ContentfulError extends Error {
    constructor(
        public readonly message: string, 
        public readonly status: ContentfulStatusCode,
        public readonly data?: unknown
    ) {
        super(message)
    }
}