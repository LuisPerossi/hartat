import { ContentfulStatusCode } from "hono/utils/http-status";

export class ContentfulError extends Error {
    constructor(
        message: string, 
        public status: ContentfulStatusCode,
        public data?: unknown
    ) {
        super(message)
    }
}