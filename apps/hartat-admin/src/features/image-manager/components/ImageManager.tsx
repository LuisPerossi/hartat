import { useEffect, useState } from "react"
import Searchbar from "../../../components/Searchbar"
import Pagination from "../../../components/Pagination"
import LoadingSpinner from "../../../components/LoadingSpinner"
import UploadButton from "./UploadButton"
import OrderSelect from "./OrderSelect"
import ImageGrid from "./ImageGrid"
import SelectionOptions from "./SelectionOptions"
import DropZone from "./DropZone"

import type { Image } from "@hartat/types/images"
import type { SortOrder } from "../types/images"

import { uploadImages } from "../utils/images"
import { fetchImages } from "../utils/images"

const API_URL = import.meta.env.VITE_API_URL

function ImageManager() {
    const [isLoading, setIsLoading] = useState(false)
    const [search, setSearch] = useState("")
    const [sortOrder, setSortOrder] = useState<SortOrder>({ sort: 'date', order: 'desc' })
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [images, setImages] = useState<Image[]>([])
    const [selectedImages, setSelectedImages] = useState<Map<string, Image>>(new Map())
    const [forceReload, setForceReload] = useState(0)

    //Fetching images and resetting selecition
    useEffect(() => {
        setSelectedImages(new Map())
        fetchImages({ search, sortOrder, page, setIsLoading, setImages, setTotalPages, apiUrl: API_URL})
    }, [search, page, sortOrder, forceReload])

    //Resetting the page on search
    useEffect(() => { setPage(1) }, [search, sortOrder, forceReload])

    //Uploading images
    const handleUpload = (files: File[]) => {
        uploadImages({ files, setIsLoading, setForceReload, apiUrl: API_URL })
    }

    return (
        <>
            { isLoading && <LoadingSpinner /> }

            <h1 className="text-2xl font-bold"> Minhas Imagens </h1>

            <div className="flex gap-3 flex-wrap">
                <Searchbar onSearch={setSearch}/>
                <UploadButton  onSelect={handleUpload} />
            </div>

            <div className="flex flex-col gap-3 md:flex-row-reverse">
                <OrderSelect onChange={setSortOrder} />
                <SelectionOptions 
                    selectedImages={selectedImages} 
                    setIsLoading={setIsLoading} 
                    setForceReload={setForceReload} 
                    apiUrl={API_URL} 
                />
            </div>

            <DropZone onDrop={handleUpload}>
                <ImageGrid 
                    images={images} 
                    selectedImages={selectedImages} 
                    setSelectedImages={setSelectedImages} 
                    setForceReload={setForceReload} 
                    apiUrl={API_URL} 
                />
            </DropZone>

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
    )
}

export default ImageManager