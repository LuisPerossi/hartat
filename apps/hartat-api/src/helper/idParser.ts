import { HonoRequest } from "hono";
import { ContentfulError } from "../error/ContentfulError";

export function idParser(req: HonoRequest) {
    const param = req.param('id')
    const id = Number(param)

    if (!Number.isInteger(id) || id <= 0) {
        throw new ContentfulError('Invalid id', 400)
    }

    return id
}