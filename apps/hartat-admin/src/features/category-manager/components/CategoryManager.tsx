import { useEffect, useState } from "react"
import Searchbar from "@/components/Searchbar"
import LoadingSpinner from "@/components/LoadingSpinner"

import CreateButton from "./CreateButton"
import CategoryList from "./CategoryList"
import type { Category } from "@hartat/types/categories"
import { fetchCategories } from "../utils/categories"

function CategoryManager() {
    const [search, setSearch] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [forceReload, setForceReload] = useState(0)

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

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(search.trim().toLowerCase())
    )

    return (
        <>
            { isLoading && <LoadingSpinner /> }

            <h1 className="text-2xl font-bold"> Minhas Categorias </h1>

            <div className="flex gap-3 flex-wrap">
                <Searchbar onSearch={setSearch} />
                <CreateButton 
                    onCreated={() => setForceReload(prev => prev + 1)} 
                    setIsLoading={setIsLoading} 
                />
            </div>

            <CategoryList 
                categories={filteredCategories} 
                onRenamed={() => setForceReload(prev => prev + 1)} 
                setIsLoading={setIsLoading} 
            />
        </>
    )
}

export default CategoryManager
