import { HonoRequest } from "hono";
import { BadRequestError } from "../error/BadRequestError";

export async function jsonParser(req: HonoRequest): Promise<unknown> {
    try {
        return await req.json()
    } catch {
        throw new BadRequestError('Invalid JSON')
    }
}