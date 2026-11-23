import { API_URL } from "@/config/env"
import type { Image } from "@hartat/types/images"

import { DownloadIcon, PencilIcon, TrashIcon } from "@phosphor-icons/react"

import { downloadImage } from "../utils/images/single/download"
import { renameImage } from "../utils/images/single/rename"
import { deleteImage } from "../utils/images/single/delete"

interface ImageContainerProps {
    image: Image,
    selectedImages: Map<string, Image>,
    setSelectedImages: React.Dispatch<React.SetStateAction<Map<string, Image>>>,
    setForceReload: React.Dispatch<React.SetStateAction<number>>,
    isModal?: boolean,
    multiple?: boolean
}

function ImageContainer({ image, selectedImages, setSelectedImages, setForceReload, isModal = false, multiple = true }: ImageContainerProps) {
    const imageUrl = `${API_URL}/admin/images/${image.key}`
    const isSelected = selectedImages.has(image.key)

    const toggleSelection = (checked: boolean) => {
        setSelectedImages(prev => {
            const updated = isModal && !multiple ? new Map<string, Image>() : new Map(prev)

            if (checked) {
                updated.set(image.key, image)
            } else {
                updated.delete(image.key)
            }

            return updated
        })
    }

    const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
        toggleSelection(e.target.checked)
    }

    const handleClick = () => {
        if (isModal) {
            toggleSelection(!isSelected)
        } else {
            window.open(imageUrl, '_blank')
        }
    }

    const handleDownload = async () => {
        try {
            const fileName = `${image.name}${image.extension}`
            const blob = await downloadImage({ imageUrl })
            const link = document.createElement('a')

            link.href = URL.createObjectURL(blob)
            link.download = fileName
            link.click()

            URL.revokeObjectURL(link.href)
        } catch(err) {
            console.error(err)
            window.alert('Erro ao baixar imagem')
        }
    }

    const handleRename = async () => {
        const input = window.prompt('Digite o novo nome da imagem:', image.name)

        if (input === null) { return }
        if (input.trim().length === 0) { return window.alert('O novo nome não pode ser vazio') }

        try {
            await renameImage({ id: image.id, name: input })
            setForceReload(prev => prev + 1)
        } catch(err) {
            console.error(err)
            window.alert('Erro ao renomear imagem')
        }
    }

    const handleDelete = async () => {
        const confirm = window.confirm(`Tem certeza que deseja excluir a imagem "${image.name}"?`)
        if (confirm === false) { return }

        try {
            await deleteImage({ id: image.id })
            setForceReload(prev => prev + 1)
        } catch(err) {
            console.error(err)
            window.alert('Erro ao excluir a imagem')
        }
    }

    return (
        <div>
            <div
                className={`relative group cursor-pointer rounded-md overflow-hidden border bg-gray-100 transition-all ${
                    isSelected ? "border-blue-600 ring-2 ring-blue-600" : "border-gray-200 hover:border-gray-300"
                }`}
            >
                <div className="absolute inset-0 pointer-events-none">
                    <input
                        type="checkbox"
                        onChange={handleCheckbox}
                        checked={isSelected}
                        className="absolute bottom-1.5 left-1.5 size-5 shrink-0 accent-blue-600 pointer-events-auto cursor-pointer md:hidden group-hover:block checked:block"
                    />
                    <div className="absolute top-1.5 right-1.5 flex items-start gap-1 md:hidden group-hover:flex *:pointer-events-auto">
                        <button
                            type="button"
                            title="Baixar imagem"
                            onClick={handleDownload}
                            className="p-1.5 rounded-sm bg-gray-200/90 hover:bg-gray-300 text-gray-700 cursor-pointer transition-colors"
                        >
                            <DownloadIcon className="text-base" />
                        </button>
                        <button
                            type="button"
                            title="Renomear imagem"
                            onClick={handleRename}
                            className="p-1.5 rounded-sm bg-gray-200/90 hover:bg-gray-300 text-gray-700 cursor-pointer transition-colors"
                        >
                            <PencilIcon className="text-base" />
                        </button>
                        <button
                            type="button"
                            title="Excluir imagem"
                            onClick={handleDelete}
                            className="p-1.5 rounded-sm bg-gray-200/90 hover:bg-gray-300 text-gray-700 cursor-pointer transition-colors"
                        >
                            <TrashIcon className="text-base" />
                        </button>
                    </div>
                </div>

                <img
                    src={`${imageUrl}?preview`}
                    alt={image.name}
                    className="w-full aspect-square object-cover cursor-pointer block"
                    onClick={handleClick}
                />
            </div>

            <p className="mt-1 text-sm text-gray-700 truncate" title={image.name}>{image.name}</p>
        </div>
    )
}

export default ImageContainer