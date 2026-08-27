import { HonoRequest } from "hono";
import { ContentfulError } from "../error/ContentfulError";

export async function jsonParser(req: HonoRequest): Promise<unknown> {
    try {
        return await req.json()
    } catch {
        throw new ContentfulError('Invalid JSON', 400)
    }
}