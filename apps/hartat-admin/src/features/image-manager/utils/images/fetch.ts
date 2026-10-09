import type { Image, GetImagesResponse } from "@hartat/types/images"
import type { SortOrder } from "../../types/images"

interface FetchImagesProps {
    search: string,
    sortOrder: SortOrder,
    page: number,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setImages: React.Dispatch<React.SetStateAction<Image[]>>,
    setTotalPages: React.Dispatch<React.SetStateAction<number>>,
    apiUrl: string
}

const FETCH_LIMIT = 30

export async function fetchImages(props: FetchImagesProps) {
    const { search, sortOrder, page, setIsLoading, setImages, setTotalPages, apiUrl } = props
    setIsLoading(true)

    try {
        const { sort, order } = sortOrder
        const query = `search=${search}&sort=${sort}&order=${order}&page=${page}&limit=${FETCH_LIMIT}`

        const response = await fetch(`${apiUrl}/admin/images?${query}`)
        const apiResponse = await response.json() as GetImagesResponse

        if (response.ok === false) {
            console.error(apiResponse)
            throw new Error('Unable to load images')
        }

        setImages(apiResponse.data.images)
        setTotalPages(apiResponse.data.pagination.totalPages)
    } catch (err) {
        console.error(err)
        window.alert('Erro ao carregar imagens')
    } finally {
        setIsLoading(false)
    }
}