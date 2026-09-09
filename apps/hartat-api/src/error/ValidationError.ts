export class ValidationError extends Error {
    constructor(public readonly message: string, public readonly data: unknown) {
        super(message)
    }
}