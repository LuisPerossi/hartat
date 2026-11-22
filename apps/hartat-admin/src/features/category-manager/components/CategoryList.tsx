import { useState } from "react"
import type { Category } from "@hartat/types/categories"
import { CheckIcon, CopyIcon, PencilIcon, TrashIcon } from "@phosphor-icons/react"
import { deleteCategory } from "../utils/categories/delete"

interface CategoryListProps {
    categories: Category[]
    totalCount?: number
    maxCategories?: number
    onEdit: (category: Category) => void
    onDeleted: () => void
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
}

function ColorSquare({ color }: { color?: string | null }) {
    const [copied, setCopied] = useState(false)
    const validColor = color && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color) ? color : "#C58852"

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            await navigator.clipboard.writeText(validColor.toUpperCase())
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch {
            // clipboard fallback if restricted
        }
    }

    return (
        <div className="relative group inline-flex items-center justify-center">
            <button
                type="button"
                onClick={handleCopy}
                className="w-7 h-7 rounded-md shrink-0 border border-black/15 shadow-2xs cursor-pointer hover:scale-105 active:scale-95 transition-transform flex items-center justify-center relative focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400"
                style={{ backgroundColor: validColor }}
                aria-label={`Cor ${validColor}. Clique para copiar.`}
            >
                {copied && (
                    <CheckIcon className="text-white text-xs drop-shadow" />
                )}
            </button>

            {/* Hover Tooltip showing hex with copy icon - centered */}
            <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex items-center gap-1.5 bg-gray-900 text-white text-[11px] font-mono font-medium px-3 py-1 rounded shadow-md pointer-events-none z-30 whitespace-nowrap w-max max-w-none">
                <span>{copied ? "Copiado!" : validColor.toUpperCase()}</span>
                {!copied && <CopyIcon className="text-xs text-gray-300 shrink-0" />}
            </div>
        </div>
    )
}

function CategoryList({
    categories,
    totalCount,
    maxCategories,
    onEdit,
    onDeleted,
    setIsLoading
}: CategoryListProps) {
    const handleDelete = async (category: Category) => {
        const confirmed = window.confirm(
            `Deseja excluir a categoria "${category.name}"? Os posts vinculados perderão a categoria.`
        )

        if (!confirmed) { return }

        setIsLoading(true)

        try {
            await deleteCategory({ id: category.id })
            onDeleted()
        } catch (err: unknown) {
            console.error(err)
            const message = err instanceof Error ? err.message : 'Erro ao excluir categoria'
            window.alert(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-2">
            {/* Desktop Table (hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto border border-gray-300 rounded-lg">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="divide-x divide-gray-200 bg-gray-100 border-b border-gray-300 text-sm font-semibold text-gray-700">
                            <th className="py-3 px-4 w-28 min-w-28 text-center"> Cor </th>
                            <th className="py-3 px-4 w-full"> Nome </th>
                            <th className="py-3 px-4 w-fit text-center md:text-nowrap"> Qtd. postagens </th>
                            <th className="py-3 px-4 w-fit text-center"> Ações </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-8 text-center text-gray-500">
                                    Nenhuma categoria encontrada
                                </td>
                            </tr>
                        ) : (
                            categories.map(category => (
                                <tr key={category.id} className="divide-x divide-gray-200 hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4 w-28 min-w-28 text-center">
                                        <div className="flex justify-center items-center">
                                            <ColorSquare color={category.color} />
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="font-medium text-gray-900 text-sm">
                                            {category.name}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-600 text-center">
                                        {category.postCount !== undefined ? category.postCount : 0}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                type="button"
                                                onClick={() => onEdit(category)}
                                                title="Editar categoria"
                                                className="p-1.5 rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer transition-colors"
                                            >
                                                <PencilIcon className="text-lg" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(category)}
                                                title="Excluir categoria"
                                                className="p-1.5 rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer transition-colors"
                                            >
                                                <TrashIcon className="text-lg" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card List (visible on mobile, matches PostList & EventList) */}
            <div className="md:hidden border border-gray-300 rounded-lg divide-y divide-gray-200 overflow-hidden bg-white">
                {categories.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                        Nenhuma categoria encontrada
                    </div>
                ) : (
                    categories.map((category) => (
                        <div
                            key={category.id}
                            className="p-3.5 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <ColorSquare color={category.color} />
                                <div className="flex flex-col min-w-0">
                                    <span className="font-medium text-gray-900 text-sm truncate">
                                        {category.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {category.postCount !== undefined
                                            ? category.postCount === 1
                                                ? "1 postagem"
                                                : `${category.postCount} postagens`
                                            : "0 postagens"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => onEdit(category)}
                                    title="Editar categoria"
                                    className="p-1.5 rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer transition-colors"
                                >
                                    <PencilIcon className="text-lg" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(category)}
                                    title="Excluir categoria"
                                    className="p-1.5 rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer transition-colors"
                                >
                                    <TrashIcon className="text-lg" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500 px-1">
                {totalCount !== undefined && maxCategories !== undefined && totalCount >= maxCategories && (
                    <span className="text-amber-600 font-medium">
                        Limite máximo de {maxCategories} categorias atingido
                    </span>
                )}
                <span className="ml-auto">
                    {totalCount !== undefined && maxCategories !== undefined
                        ? (categories.length !== totalCount
                            ? `${categories.length} de ${totalCount}/${maxCategories} categorias`
                            : `${totalCount}/${maxCategories} categorias`)
                        : (categories.length === 1 ? '1 categoria' : `${categories.length} categorias`)}
                </span>
            </div>
        </div>
    )
}

export default CategoryList
