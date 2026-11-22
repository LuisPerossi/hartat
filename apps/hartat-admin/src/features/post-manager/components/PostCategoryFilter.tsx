import type { Category } from "@hartat/types/categories"

interface PostCategoryFilterProps {
    categories: Category[]
    selectedCategory?: number
    onChange: (categoryId?: number) => void
}

function PostCategoryFilter({ categories, selectedCategory, onChange }: PostCategoryFilterProps) {
    const activeCategory = categories.find((c) => c.id === selectedCategory)

    return (
        <label className="flex gap-2 items-center text-sm font-medium text-gray-700">
            Categoria:
            <div className="relative flex items-center">
                <select
                    value={selectedCategory ?? ""}
                    onChange={(e) => {
                        const val = e.target.value
                        onChange(val === "" ? undefined : Number(val))
                    }}
                    className="rounded-md border border-gray-300 pl-2.5 pr-8 py-1.5 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value="">Todas as categorias</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
                {activeCategory?.color && (
                    <span 
                        className="absolute right-2.5 w-2.5 h-2.5 rounded-full pointer-events-none border border-black/20"
                        style={{ backgroundColor: activeCategory.color }}
                        title={`Cor: ${activeCategory.color}`}
                    />
                )}
            </div>
        </label>
    )
}

export default PostCategoryFilter
