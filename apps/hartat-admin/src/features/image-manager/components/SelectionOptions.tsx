import type { Image } from "@hartat/types/images"
import { DownloadIcon, TrashIcon } from "@phosphor-icons/react"

import { deleteSelectedImages } from "../utils/images/multiple/delete";
import { downloadSelectedImages } from "../utils/images/multiple/download";

interface SelectionOptionsProps {
    selectedImages: Map<string, Image>,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
    setForceReload: React.Dispatch<React.SetStateAction<number>>
}

function SelectionOptions({ selectedImages, setIsLoading, setForceReload }: SelectionOptionsProps) {
    const handleDownloadAll = async () => {
        if (selectedImages.size === 0) { return window.alert('Nenhuma imagem selecionada') }

        setIsLoading(true)

        try {
            const { errorCount, content } = await downloadSelectedImages({ selectedImages })

            if (errorCount === selectedImages.size) { throw new Error('Unable to download images') }

            const link = document.createElement('a')
            link.href = URL.createObjectURL(content)
            link.download = 'imagens.zip'
            link.click()

            if (errorCount > 0) { window.alert('Algumas imagens não foram baixadas') }

            URL.revokeObjectURL(link.href)
        } catch(err) {
            console.error(err)
            window.alert('Erro ao baixar imagens')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteAll = async () => {
        if (selectedImages.size === 0) { return window.alert('Nenhuma imagem selecionada') }

        const confirm = window.confirm('Tem certeza que deseja excluir as imagens selecionadas?')
        if (confirm === false) { return }

        setIsLoading(true)

        try {
            const { errorCount } = await deleteSelectedImages({ selectedImages })

            if (errorCount > 0) { 
                if (errorCount === selectedImages.size) { throw new Error('Unable to delete images') }
                else { window.alert('Algumas imagens não foram excluídas') }
            }

            setForceReload(prev => prev + 1)
        } catch(err) {
            console.error(err)
            window.alert('Erro ao excluir imagens')
        } finally {
            setIsLoading(false)
        }
    }

    const selectedCount = selectedImages.size

    return (
        <div className="flex w-full flex-wrap items-center justify-between gap-2 md:w-auto md:justify-start md:gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <span>Selecionados:</span>
                <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                        selectedCount > 0
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-200 text-gray-700"
                    }`}
                >
                    {selectedCount}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    disabled={selectedCount === 0}
                    onClick={handleDownloadAll}
                    className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 px-3 py-1.5 text-sm font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                >
                    <DownloadIcon className="text-base" />
                    Baixar
                </button>

                <button
                    type="button"
                    disabled={selectedCount === 0}
                    onClick={handleDeleteAll}
                    className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-gray-700 px-3 py-1.5 text-sm font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-300"
                >
                    <TrashIcon className="text-base" />
                    Excluir
                </button>
            </div>
        </div>
    )
}

export default SelectionOptions