import type { Category } from "@hartat/types/categories"

interface FetchCategoriesProps {
    search: string,
    order: string,
    page: number,
    apiUrl: string,
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setForceReload: React.Dispatch<React.SetStateAction<number>>
}

const LIMIT = 30

export async function fetchCategories(props: FetchCategoriesProps) {
    const { search, order, page, apiUrl, setCategories, setIsLoading, setForceReload } = props
    setIsLoading(true)

    try {
        const query = `search=${search}&order=${order}&page=${page}&limit=${LIMIT}`
        const response = await fetch(`${apiUrl}/admin/categories?${query}`)

        console.log(await response.json())

        //setForceReload(prev => prev + 1)
    } catch(err) {
        console.error(err)
        window.alert('Erro ao carregar categorias')
    } finally {
        setIsLoading(false)        
    }
}