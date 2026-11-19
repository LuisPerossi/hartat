import type { Category } from "@hartat/types/categories"
import { PencilIcon, TrashIcon } from "@phosphor-icons/react"
import { renameCategory } from "../utils/categories/rename"
import { deleteCategory } from "../utils/categories/delete"

interface CategoryListProps {
    categories: Category[],
    totalCount?: number,
    maxCategories?: number,
    onRenamed: () => void,
    onDeleted: () => void,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
}

function CategoryList({ categories, totalCount, maxCategories, onRenamed, onDeleted, setIsLoading }: CategoryListProps) {
    const handleDelete = async (category: Category) => {
        const confirmed = window.confirm(`Deseja excluir a categoria "${category.name}"? Os posts vinculados perderão a categoria.`)

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

    const handleRename = async (category: Category) => {
        const input = window.prompt('Digite o novo nome da categoria:', category.name)

        if (input === null) { return }

        const trimmed = input.trim()
        if (trimmed.length === 0) {
            return window.alert('O novo nome não pode ser vazio')
        }
        if (trimmed.length > 20) {
            return window.alert('O novo nome deve ter no máximo 20 caracteres')
        }
        if (trimmed === category.name) {
            return
        }

        setIsLoading(true)

        try {
            await renameCategory({ id: category.id, name: trimmed })
            onRenamed()
        } catch (err: unknown) {
            console.error(err)
            const message = err instanceof Error ? err.message : 'Erro ao renomear categoria'
            window.alert(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="overflow-x-auto border border-gray-300 rounded-lg">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="divide-x divide-gray-200 bg-gray-100 border-b border-gray-300 text-sm font-semibold text-gray-700">
                            <th className="py-3 px-4 w-full"> Nome </th>
                            <th className="py-3 px-4 w-fit text-center md:text-nowrap"> Qtd. postagens </th>
                            <th className="py-3 px-4 w-fit text-center"> Ações </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="py-8 text-center text-gray-500">
                                    Nenhuma categoria encontrada
                                </td>
                            </tr>
                        ) : (
                            categories.map(category => (
                                <tr key={category.id} className="divide-x divide-gray-200 hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2 font-medium text-gray-900">
                                            {/*<TagIcon className="text-gray-500 shrink-0" />*/}
                                            <span>{category.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-gray-600 text-center">
                                        {category.postCount !== undefined ? category.postCount : 0}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleRename(category)}
                                                title="Renomear categoria"
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
