import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { PlusIcon } from "@phosphor-icons/react"
import Searchbar from "@/components/Searchbar"
import Pagination from "@/components/Pagination"
import LoadingSpinner from "@/components/LoadingSpinner"
import type { Post } from "@hartat/types/posts"
import type { Category } from "@hartat/types/categories"
import { fetchCategories } from "@/features/category-manager/utils/categories/fetch"
import PostList from "./PostList"
import PostOrderSelect from "./PostOrderSelect"
import PostCategoryFilter from "./PostCategoryFilter"
import type { SortOrder } from "../types/posts"
import { fetchPosts } from "../utils/posts"

function PostManager() {
    const [isLoading, setIsLoading] = useState(false)
    const [posts, setPosts] = useState<Post[]>([])
    const [categories, setCategories] = useState<Category[]>([])

    // Filters and pagination
    const [search, setSearch] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined)
    const [sortOrder, setSortOrder] = useState<SortOrder>({ sort: "date", order: "desc" })
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Forced reload trigger
    const [forceReload, setForceReload] = useState(0)

    // Load categories once
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const cats = await fetchCategories()
                setCategories(cats)
            } catch (err) {
                console.error("Erro ao carregar categorias:", err)
            }
        }
        loadCategories()
    }, [])

    // Handlers that reset page to 1
    const handleSearch = (newSearch: React.SetStateAction<string>) => {
        setSearch(newSearch)
        setPage(1)
    }

    const handleCategoryChange = (catId?: number) => {
        setSelectedCategory(catId)
        setPage(1)
    }

    const handleSortOrderChange: React.Dispatch<React.SetStateAction<SortOrder>> = (action) => {
        setSortOrder(action)
        setPage(1)
    }

    // Fetch posts
    useEffect(() => {
        const loadPosts = async () => {
            setIsLoading(true)
            try {
                const { posts, pagination } = await fetchPosts({
                    search,
                    categoryId: selectedCategory,
                    sort: sortOrder.sort,
                    order: sortOrder.order,
                    page,
                    limit: 10
                })
                setPosts(posts)
                setTotalPages(pagination.totalPages || 1)
            } catch (err: unknown) {
                console.error(err)
                const message = err instanceof Error ? err.message : "Erro ao carregar postagens"
                window.alert(message)
            } finally {
                setIsLoading(false)
            }
        }

        loadPosts()
    }, [search, selectedCategory, sortOrder, page, forceReload])

    return (
        <>
            {isLoading && <LoadingSpinner />}

            <h1 className="text-2xl font-bold">Minhas Postagens</h1>

            <div className="flex gap-3 flex-wrap items-center">
                <Searchbar onSearch={handleSearch} />

                <PostCategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onChange={handleCategoryChange}
                />

                <PostOrderSelect value={sortOrder} onChange={handleSortOrderChange} />

                <Link
                    to="/posts/new"
                    className="flex w-fit gap-2 px-4 py-2 items-center rounded-full text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shrink-0"
                >
                    Nova Postagem <PlusIcon className="text-xl" />
                </Link>
            </div>

            <PostList
                posts={posts}
                onDeleted={() => setForceReload((prev) => prev + 1)}
                setIsLoading={setIsLoading}
            />

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
    )
}

export default PostManager
