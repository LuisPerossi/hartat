import { useEffect, useState } from "react"
import Searchbar from "../../../components/Searchbar"
import LoadingSpinner from "../../../components/LoadingSpinner"

import CreateButton from "./CreateButton"
import CategoryList from "./CategoryList"
import type { Category } from "@hartat/types/categories"
import { fetchCategories } from "../utils/categories"

const API_URL = import.meta.env.VITE_API_URL

function CategoryManager() {
    const [search, setSearch] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [order, setOrder] = useState('')
    const [page, setPage] = useState(1)
    const [forceRelod, setForceReload] = useState(0)

    useEffect(() => {
        fetchCategories({ search, order, page, setCategories, setIsLoading, setForceReload, apiUrl: API_URL })
    }, [search, order, page, forceRelod])

    return (
        <>
            { isLoading && <LoadingSpinner /> }

            <h1 className="text-2xl font-bold"> Minhas Categorias </h1>

            <div className="flex">
                <Searchbar onSearch={setSearch} />
                <CreateButton />
            </div>

            <CategoryList categories={categories} />
        </>
    )
}

export default CategoryManager