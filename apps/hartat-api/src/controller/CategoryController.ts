import { Context } from "hono";
import { CategoryService } from "../service/CategoryService";
import { jsonParser } from "../helper/jsonParser";
import { validate } from "../helper/validate";
import { createCategorySchema, updateCategorySchema } from "../schema/category.schema";
import { idParser } from "../helper/idParser";

export class CategoryController {
    constructor(private readonly service: CategoryService) {}

    public async create(c: Context) {
        const body = await jsonParser(c.req)

        const createCategory = validate(createCategorySchema, body)

        const category = await this.service.create(createCategory)

        return c.json({ message: 'Created category', category }, 201)
    }

    public async getById(c: Context) {
        const id = idParser(c.req)

        const category = await this.service.getById(id)

        return c.json({ message: 'Retrieved category', category }, 200)
    }

    public async getAll(c: Context) {
        const categories = await this.service.getAll()

        return c.json({ message: 'Retrieved categories', categories }, 200)
    }

    public async update(c: Context) {
        const id = idParser(c.req)
        const body = await jsonParser(c.req)

        const updateCategory = validate(updateCategorySchema, body)

        const category = await this.service.update(id, updateCategory)

        return c.json({ message: 'Updated category', category }, 200)
    }

    public async delete(c: Context) {
        const id = idParser(c.req)

        await this.service.delete(id)

        return c.json({ message: 'Deleted category' }, 200)
    }
}