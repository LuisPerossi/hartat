import { useEffect, useMemo, useState } from "react"
import Searchbar from "@/components/Searchbar"
import LoadingSpinner from "@/components/LoadingSpinner"

import CreateButton from "./CreateButton"
import CategoryList from "./CategoryList"
import { type Category, MAX_CATEGORIES } from "@hartat/types/categories"
import { fetchCategories } from "../utils/categories"

type SortField = 'name' | 'postCount'
type SortOrder = 'asc' | 'desc'

function CategoryManager() {
    const [search, setSearch] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [forceReload, setForceReload] = useState(0)
    const [sortField, setSortField] = useState<SortField>('name')
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

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

    return (
        <>
            { isLoading && <LoadingSpinner /> }

            <h1 className="text-2xl font-bold"> Minhas Categorias </h1>

            <div className="flex gap-3 flex-wrap">
                <Searchbar onSearch={setSearch} />
                <label className="flex gap-2 items-center text-sm font-medium text-gray-700">
                    Ordenar:
                    <select
                        onChange={handleSortChange}
                        defaultValue="name-asc"
                        className="rounded-md border border-gray-300 px-2 py-1.5 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="name-asc">Nome (A-Z)</option>
                        <option value="name-desc">Nome (Z-A)</option>
                        <option value="postCount-desc">Postagens (maior)</option>
                        <option value="postCount-asc">Postagens (menor)</option>
                    </select>
                </label>
                <CreateButton 
                    onCreated={() => setForceReload(prev => prev + 1)} 
                    setIsLoading={setIsLoading} 
                    disabled={isLimitReached}
                />
            </div>

            <CategoryList 
                categories={filteredCategories} 
                totalCount={categories.length}
                maxCategories={MAX_CATEGORIES}
                onRenamed={() => setForceReload(prev => prev + 1)} 
                onDeleted={() => setForceReload(prev => prev + 1)}
                setIsLoading={setIsLoading} 
            />
        </>
    )
}

export default CategoryManager
