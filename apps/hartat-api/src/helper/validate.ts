import z from "zod";
import { ValidationError } from "../error/ValidationError";

export function validate<T extends z.ZodType>(schema: T, value: unknown) {
    const result = z.safeParse(schema, value)

    if (!result.success) {
        throw new ValidationError('Validation error', z.flattenError(result.error))
    }

    return result.data
}