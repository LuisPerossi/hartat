import type { Category } from "@hartat/types/categories"

interface PostCategoryFilterProps {
    categories: Category[]
    selectedCategory?: number
    onChange: (categoryId?: number) => void
}

function PostCategoryFilter({ categories, selectedCategory, onChange }: PostCategoryFilterProps) {
    const activeCategory = categories.find((c) => c.id === selectedCategory)

    return (
        <label className="flex w-full md:w-auto gap-2 items-center text-sm font-medium text-gray-700 min-w-0">
            <span className="shrink-0">Categoria:</span>
            <div className="relative flex-1 md:flex-initial flex items-center min-w-0">
                {activeCategory?.color && (
                    <span 
                        className="absolute left-2.5 w-2.5 h-2.5 rounded-full pointer-events-none border border-black/20 z-10"
                        style={{ backgroundColor: activeCategory.color }}
                        title={`Cor: ${activeCategory.color}`}
                    />
                )}
                <select
                    value={selectedCategory ?? ""}
                    onChange={(e) => {
                        const val = e.target.value
                        onChange(val === "" ? undefined : Number(val))
                    }}
                    className={`w-full md:w-auto rounded-md border border-gray-300 py-1.5 pr-8 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm min-w-0 truncate ${
                        activeCategory?.color ? "pl-7" : "pl-2.5"
                    }`}
                >
                    <option value="">Todas as categorias</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>
        </label>
    )
}

export default PostCategoryFilter
