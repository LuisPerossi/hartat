import type { Category } from "@hartat/types/categories"
import { PencilIcon, TagIcon } from "@phosphor-icons/react"
import { renameCategory } from "../utils/categories/rename"

interface CategoryListProps {
    categories: Category[],
    onRenamed: () => void,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
}

function CategoryList({ categories, onRenamed, setIsLoading }: CategoryListProps) {
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
                        <tr className="bg-gray-100 border-b border-gray-300 text-sm font-semibold text-gray-700">
                            <th className="py-3 px-4"> Nome </th>
                            <th className="py-3 px-4"> Qtd. postagens </th>
                            <th className="py-3 px-4 text-right"> Ações </th>
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
                                <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2 font-medium text-gray-900">
                                            <TagIcon className="text-gray-500 shrink-0" />
                                            <span>{category.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-gray-600">
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
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="w-fit ml-auto text-sm text-gray-500 px-1">
                {categories.length === 1 ? '1 categoria' : `${categories.length} categorias`}
            </div>
        </div>
    )
}

export default CategoryList
