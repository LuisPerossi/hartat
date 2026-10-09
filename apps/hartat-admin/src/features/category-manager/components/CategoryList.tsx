import type { Category } from "@hartat/types/categories"

interface CategoryListProps {
    categories: Category[]
}

function CategoryList({ categories }: CategoryListProps) {
    console.log(categories)

    return (
        <div>
            Lista
        </div>
    )
}

export default CategoryList