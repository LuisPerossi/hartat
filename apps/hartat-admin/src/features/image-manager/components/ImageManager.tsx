import { useEffect, useState } from "react"
import { CheckIcon, WarningCircleIcon, XIcon } from "@phosphor-icons/react"

import Searchbar from "@/components/Searchbar"
import Pagination from "@/components/Pagination"
import LoadingSpinner from "@/components/LoadingSpinner"

import UploadButton from "./UploadButton"
import OrderSelect from "./OrderSelect"
import ImageGrid from "./ImageGrid"
import SelectionOptions from "./SelectionOptions"
import DropZone from "./DropZone"

import type { FailedImage, Image } from "@hartat/types/images"
import type { SortOrder } from "../types/images"

import { uploadImages } from "../utils/images/upload"
import { fetchImages } from "../utils/images/fetch"

interface ImageManagerProps {
    onConfirmSelection?: (images: Image[]) => void
    isModal?: boolean
    multiple?: boolean
}

function ImageManager({ onConfirmSelection, isModal = false, multiple = true }: ImageManagerProps = {}) {
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
    const [uploadErrors, setUploadErrors] = useState<FailedImage[]>([])

    //Forced reload
    const [forceReload, setForceReload] = useState(0)

    const handleSearch = (newSearch: React.SetStateAction<string>) => {
        setSearch(newSearch)
        setPage(1)
    }

    const handleSortOrderChange: React.Dispatch<React.SetStateAction<SortOrder>> = (action) => {
        setSortOrder(action)
        setPage(1)
    }

    //Fetching images and resetting selection
    useEffect(() => {
        let isMounted = true

        const loadImages = async () => {
            if (!isModal) {
                setSelectedImages(new Map())
            }
            setIsLoading(true)

            try {
                const { sort, order } = sortOrder
                const { images: fetchedImages, pagination } = await fetchImages({ search, sort, order, page })

                if (isMounted) {
                    setImages(fetchedImages)
                    setTotalPages(pagination.totalPages)
                }
            } catch(err) {
                console.error(err)
                window.alert('Erro ao carregar imagens')
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        loadImages()

        return () => {
            isMounted = false
        }
    }, [search, page, sortOrder, forceReload, isModal])

    //Uploading images
    const handleUpload = async (files: File[]) => {
        if (files.length === 0) return

        setIsLoading(true)
        setUploadErrors([])

        try {
            const { uploadedImages, failedImages } = await uploadImages({ files })

            if (failedImages.length > 0) {
                setUploadErrors(failedImages)
            }

            if (uploadedImages.length > 0) {
                setForceReload(prev => prev + 1)
            }
        } catch(err) {
            console.error(err)
            setUploadErrors([{
                name: 'Envio de imagens',
                type: '',
                size: 0,
                cause: 'Ocorreu um erro inesperado ao enviar as imagens',
            }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            { isLoading && <LoadingSpinner /> }

            { !isModal && <h1 className="text-2xl font-bold">Minhas Imagens</h1> }

            <div className="flex gap-2.5 sm:gap-3 flex-wrap items-center">
                <Searchbar onSearch={handleSearch} />
                <div className={`flex items-center gap-2 ${isModal ? "w-full sm:w-auto" : ""}`}>
                    <div className="shrink-0">
                        <UploadButton onSelect={handleUpload} />
                    </div>
                    { isModal && onConfirmSelection && (
                        <button
                            type="button"
                            disabled={selectedImages.size === 0}
                            onClick={() => onConfirmSelection(Array.from(selectedImages.values()))}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-full text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors text-sm sm:text-base font-medium whitespace-nowrap"
                        >
                            <span>Selecionar{multiple && selectedImages.size > 0 ? ` (${selectedImages.size})` : ""}</span>
                            <CheckIcon className="text-xl shrink-0" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                { !isModal && (
                    <SelectionOptions
                        selectedImages={selectedImages}
                        setIsLoading={setIsLoading}
                        setForceReload={setForceReload}
                    />
                )}
                <div className="w-full md:w-auto md:ml-auto">
                    <OrderSelect value={sortOrder} onChange={handleSortOrderChange} />
                </div>
            </div>

            { uploadErrors.length > 0 && (
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                >
                    <WarningCircleIcon className="mt-0.5 shrink-0 text-lg text-red-600" />
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold">
                            {uploadErrors.length === 1
                                ? "1 imagem não pôde ser enviada:"
                                : `${uploadErrors.length} imagens não puderam ser enviadas:`}
                        </p>
                        <ul className="mt-1 list-disc space-y-0.5 pl-4">
                            {uploadErrors.map((failed, index) => (
                                <li key={`${failed.name}-${index}`} className="wrap-break-word">
                                    <span className="font-medium">{failed.name}</span> — {failed.cause}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <button
                        type="button"
                        onClick={() => setUploadErrors([])}
                        aria-label="Fechar aviso de erro"
                        className="shrink-0 rounded-md p-1 text-red-600 transition-colors hover:bg-red-100 cursor-pointer"
                    >
                        <XIcon className="text-base" />
                    </button>
                </div>
            ) }

            <DropZone onDrop={handleUpload}>
                <ImageGrid 
                    images={images} 
                    selectedImages={selectedImages} 
                    setSelectedImages={setSelectedImages} 
                    setForceReload={setForceReload} 
                    isModal={isModal}
                    multiple={multiple}
                />
            </DropZone>

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
    )
}

export default ImageManager