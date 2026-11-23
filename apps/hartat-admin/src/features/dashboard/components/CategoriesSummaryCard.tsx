import { Link } from "react-router-dom"
import { ArrowRightIcon } from "@phosphor-icons/react"
import type { Category } from "@hartat/types/categories"

interface CategoriesSummaryCardProps {
    categories: Category[]
}

const DEFAULT_COLOR = "#C58852"
const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

function CategoriesSummaryCard({ categories }: CategoriesSummaryCardProps) {
    const sortedCategories = [...categories].sort(
        (a, b) => (b.postCount ?? 0) - (a.postCount ?? 0)
    )

    return (
        <section className="flex flex-col border border-gray-300 rounded-lg bg-white overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gray-100 border-b border-gray-300">
                <h2 className="text-sm font-semibold text-gray-800">Categorias</h2>
                <Link
                    to="/categories"
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                >
                    Gerenciar <ArrowRightIcon className="text-xs" />
                </Link>
            </div>

            {sortedCategories.length === 0 ? (
                <div className="py-8 px-4 text-center text-sm text-gray-500">
                    Nenhuma categoria criada ainda.
                </div>
            ) : (
                <div className="flex flex-wrap gap-2 p-4">
                    {sortedCategories.map((category) => {
                        const count = category.postCount ?? 0
                        const dotColor =
                            category.color && HEX_COLOR_REGEX.test(category.color)
                                ? category.color
                                : DEFAULT_COLOR

                        return (
                            <div
                                key={category.id}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50 text-sm"
                            >
                                <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: dotColor }}
                                />
                                <span className="font-medium text-gray-800 truncate max-w-40">
                                    {category.name}
                                </span>
                                <span className="text-xs font-semibold text-gray-500">
                                    {count}
                                </span>
                            </div>
                        )
                    })}
                </div>
            )}
        </section>
    )
}

export default CategoriesSummaryCard
