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