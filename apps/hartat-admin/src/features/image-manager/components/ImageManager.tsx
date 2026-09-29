import { useEffect, useState } from "react"
import Spinner from "../../../components/Spinner"
import Searchbar from "../../../components/Searchbar"
import UploadButton from "./UploadButton"
import Pagination from "../../../components/Pagination"
import DropZone from "./DropZone"
import ImageOptions from "./ImageOptions"
import ImageGrid from "./ImageGrid"
import OrderSelect from "./OrderSelect"

export interface SortOrder {
    sort: 'date' | 'name',
    order: 'asc' | 'desc'
}


function ImageManager() {
    const [isLoading, setIsLoading] = useState(false)
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [selectionMode, setSelectionMode] = useState(false)
    const [sortOrder, setSortOrder] = useState<SortOrder>({ sort: 'date', order: 'desc' })
    const [images, setImages] = useState<File[]>([])

    useEffect(() => {
        const url = import.meta.env.VITE_API_URL
        const { sort, order } = sortOrder
        const limit = 30

        const fetchImages = async () => {
            try {
                setIsLoading(true)
                const response = await fetch(`${url}/images?search=${search}&sort=${sort}&order=${order}&page=${page}&limit=${limit}`)
                const data = await response.json()
                console.log(data)
            } catch {
                //window.alert('Erro ao carregar imagens!')
            } finally {
                setIsLoading(false)
            }
        }

        console.log({ search, page, sort, order })
        fetchImages()

    }, [search, page, sortOrder])

    const handleUpload = (files: File[]) => {
        console.log(files)
    }

    return (
        <>
            { isLoading && <Spinner coverScreen /> }

            <h1 className="text-2xl font-bold"> Minhas Imagens </h1>

            <div className="flex gap-3 flex-wrap">
                <Searchbar onSearch={setSearch}/>
                <UploadButton  onSelect={handleUpload} />
            </div>

            <OrderSelect onChange={setSortOrder} />

            <div className="flex flex-1 bg-gray-200">
                
            </div>

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
    )

    /*
    return (
        <>
            {isLoading && <Spinner coverScreen />}

            <h1 className="text-2xl font-bold"> Minhas Imagens </h1>
            
            <div className="flex gap-3">
                <Searchbar onSearch={setSearch} />
                <UploadImagesButton />
            </div>

            { /* <ImageOptions selectionMode={selectionMode} setSelectionMode={setSelectionMode} setSortOrder={setSortOrder} /> }

            <DropZone onDrop={handleUpload} children={<ImageGrid />} />

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
    )
    */
}

export default ImageManager