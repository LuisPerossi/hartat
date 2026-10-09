import { useEffect, useState } from "react"

import Searchbar from "@/components/Searchbar"
import Pagination from "@/components/Pagination"
import LoadingSpinner from "@/components/LoadingSpinner"

import UploadButton from "./UploadButton"
import OrderSelect from "./OrderSelect"
import ImageGrid from "./ImageGrid"
import SelectionOptions from "./SelectionOptions"
import DropZone from "./DropZone"

import type { Image } from "@hartat/types/images"
import type { SortOrder } from "../types/images"

import { uploadImages } from "../utils/images/upload"
import { fetchImages } from "../utils/images/fetch"

function ImageManager() {
    //Loading
    const [isLoading, setIsLoading] = useState(false)

    //Search and sorting
    const [search, setSearch] = useState("")
    const [sortOrder, setSortOrder] = useState<SortOrder>({ sort: 'date', order: 'desc' })
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    //Images and selection
    const [images, setImages] = useState<Image[]>([])
    const [selectedImages, setSelectedImages] = useState<Map<string, Image>>(new Map())

    //Forced reload
    const [forceReload, setForceReload] = useState(0)

    //Fetching images and resetting selection
    useEffect(() => { handleFetch() }, [search, page, sortOrder, forceReload])

    //Resetting the page on search
    useEffect(() => { setPage(1) }, [search, sortOrder, forceReload])

    //Fetching images
    const handleFetch = async () => {
        setSelectedImages(new Map())
        setIsLoading(true)

        try {
            const { sort, order } = sortOrder
            const { images, pagination } = await fetchImages({ search, sort, order, page })

            setImages(images)
            setTotalPages(pagination.totalPages)
        } catch(err) {
            console.error(err)
            window.alert('Erro ao carregar imagens')
        } finally {
            setIsLoading(false)
        }
    }

    //Uploading images
    const handleUpload = async (files: File[]) => {
        setIsLoading(true)

        try {
            const result = await uploadImages({ files })
            if (result === null) { return window.alert('Nenhum arquivo válido selecionado') }
            
            const { uploadedImages, failedImages } = result

            if (failedImages.length > 0) {
                if (uploadedImages.length === 0) { throw new Error('Unable to upload images') }
                else { window.alert('Algumas imagens não foram enviadas') }
            }

            setForceReload(prev => prev + 1)
        } catch(err) {
            console.error(err)
            window.alert('Erro ao enviar imagens')
        } finally {
            setIsLoading(false)
        }
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
                />
            </div>

            <DropZone onDrop={handleUpload}>
                <ImageGrid 
                    images={images} 
                    selectedImages={selectedImages} 
                    setSelectedImages={setSelectedImages} 
                    setForceReload={setForceReload} 
                />
            </DropZone>

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
    )
}

export default ImageManager