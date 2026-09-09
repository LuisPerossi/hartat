import { HonoRequest } from "hono";
import { BadRequestError } from "../error/BadRequestError";

export function idParser(req: HonoRequest) {
    const param = req.param('id')
    const id = Number(param)

    if (!Number.isInteger(id) || id <= 0) {
        throw new BadRequestError('Invalid id')
    }

    return id
}