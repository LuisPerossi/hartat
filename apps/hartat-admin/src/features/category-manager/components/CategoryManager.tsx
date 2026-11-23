import { useEffect, useMemo, useState } from "react"
import Searchbar from "@/components/Searchbar"
import LoadingSpinner from "@/components/LoadingSpinner"

import CreateButton from "./CreateButton"
import CategoryList from "./CategoryList"
import CategoryModal from "./CategoryModal"
import { type Category, MAX_CATEGORIES } from "@hartat/types/categories"
import { createCategory, fetchCategories, updateCategory } from "../utils/categories"

type SortField = 'name' | 'postCount'
type SortOrder = 'asc' | 'desc'

function CategoryManager() {
    const [search, setSearch] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [forceReload, setForceReload] = useState(0)
    const [sortField, setSortField] = useState<SortField>('name')
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)

    useEffect(() => {
        const loadCategories = async () => {
            setIsLoading(true)

            try {
                const data = await fetchCategories()
                setCategories(data)
            } catch (err: unknown) {
                console.error(err)
                const message = err instanceof Error ? err.message : 'Erro ao carregar categorias'
                window.alert(message)
            } finally {
                setIsLoading(false)
            }
        }

        loadCategories()
    }, [forceReload])

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [field, order] = e.target.value.split('-') as [SortField, SortOrder]
        setSortField(field)
        setSortOrder(order)
    }

    const filteredCategories = useMemo(() => {
        return categories
            .filter(category =>
                category.name.toLowerCase().includes(search.trim().toLowerCase())
            )
            .sort((a, b) => {
                if (sortField === 'name') {
                    return sortOrder === 'asc'
                        ? a.name.localeCompare(b.name)
                        : b.name.localeCompare(a.name)
                } else {
                    const aCount = a.postCount ?? 0
                    const bCount = b.postCount ?? 0
                    return sortOrder === 'asc' ? aCount - bCount : bCount - aCount
                }
            })
    }, [categories, search, sortField, sortOrder])

    const isLimitReached = categories.length >= MAX_CATEGORIES

    const handleOpenCreate = () => {
        if (isLimitReached) {
            window.alert('Limite máximo de 20 categorias atingido')
            return
        }
        setEditingCategory(null)
        setIsModalOpen(true)
    }

    const handleOpenEdit = (category: Category) => {
        setEditingCategory(category)
        setIsModalOpen(true)
    }

    const handleSaveCategory = async (data: { name: string; color: string }) => {
        setIsSaving(true)
        try {
            if (editingCategory) {
                await updateCategory({
                    id: editingCategory.id,
                    name: data.name,
                    color: data.color
                })
            } else {
                await createCategory({
                    name: data.name,
                    color: data.color
                })
            }
            setForceReload(prev => prev + 1)
            setIsModalOpen(false)
        } catch (err: unknown) {
            console.error(err)
            const message = err instanceof Error ? err.message : 'Erro ao salvar categoria'
            window.alert(message)
            throw err
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <>
            { (isLoading || isSaving) && <LoadingSpinner /> }

            <h1 className="text-2xl font-bold"> Minhas Categorias </h1>

            <div className="flex gap-3 flex-wrap items-center">
                <Searchbar onSearch={setSearch} />
                <CreateButton 
                    onClick={handleOpenCreate}
                    disabled={isLimitReached}
                />
            </div>

            <div className="flex flex-col gap-2.5 sm:gap-3 md:flex-row md:items-center md:justify-between">
                <div className="w-full md:w-auto md:ml-auto">
                    <label className="flex w-full md:w-auto gap-2 items-center text-sm font-medium text-gray-700 min-w-0">
                        <span className="shrink-0">Ordenar:</span>
                        <select
                            onChange={handleSortChange}
                            defaultValue="name-asc"
                            className="flex-1 md:flex-initial w-full md:w-auto min-w-0 rounded-md border border-gray-300 px-2.5 py-1.5 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        >
                            <option value="name-asc">Nome (A-Z)</option>
                            <option value="name-desc">Nome (Z-A)</option>
                            <option value="postCount-desc">Postagens (maior)</option>
                            <option value="postCount-asc">Postagens (menor)</option>
                        </select>
                    </label>
                </div>
            </div>

            <CategoryList 
                categories={filteredCategories} 
                totalCount={categories.length}
                maxCategories={MAX_CATEGORIES}
                onEdit={handleOpenEdit} 
                onDeleted={() => setForceReload(prev => prev + 1)}
                setIsLoading={setIsLoading} 
            />

            {isModalOpen && (
                <CategoryModal
                    key={editingCategory?.id ?? "create"}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveCategory}
                    initialCategory={editingCategory}
                    isSaving={isSaving}
                />
            )}
        </>
    )
}

export default CategoryManager
