import z from "zod";
import { ContentfulError } from "../error/ContentfulError";

export function parse<T extends z.ZodType>(schema: T, value: unknown) {
    const result = z.safeParse(schema, value)

    if (!result.success) {
        throw new ContentfulError("Validation error", 400, z.flattenError(result.error))
    }

    return result.data
}