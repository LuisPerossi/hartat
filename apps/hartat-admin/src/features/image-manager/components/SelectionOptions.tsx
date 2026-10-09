import { DownloadIcon, TrashIcon } from "@phosphor-icons/react"
import type { Image } from "@hartat/types/images"
import { downloadSelectedImages } from "../utils/images";
import { deleteSelectedImages } from "../utils/images";

interface SelectionOptionsProps {
    apiUrl: string,
    selectedImages: Map<string, Image>,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
    setForceReload: React.Dispatch<React.SetStateAction<number>>
}

function SelectionOptions({ apiUrl, selectedImages, setIsLoading, setForceReload }: SelectionOptionsProps) {
    const handleDownloadAll = () => {
        downloadSelectedImages({ apiUrl, selectedImages, setIsLoading })
    }

    const handleDeleteAll = () => {
        deleteSelectedImages({ apiUrl, selectedImages, setIsLoading, setForceReload })
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 md:justify-start">
            <p> Selecionados: </p>

            <div className="flex gap-3 *:cursor-pointer">
                <button className="flex items-center gap-2 rounded-full bg-gray-300 px-3 py-1" onClick={handleDownloadAll}>
                    Baixar <DownloadIcon />
                </button>

                <button className="flex items-center gap-2 rounded-full bg-gray-300 px-3 py-1" onClick={handleDeleteAll}>
                    Excluir
                    <TrashIcon />
                </button>
            </div>
        </div>
    )
}

export default SelectionOptions