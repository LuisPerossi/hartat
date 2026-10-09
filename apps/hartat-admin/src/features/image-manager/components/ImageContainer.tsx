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
    setForceReload: React.Dispatch<React.SetStateAction<number>>
}

function ImageContainer({ image, selectedImages, setSelectedImages, setForceReload }: ImageContainerProps) {
    const imageUrl = `${API_URL}/admin/images/${image.key}`

    const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedImages(prev => {
            const updated = new Map(prev)
          
            if (e.target.checked) {
                updated.set(image.key, image)
            } else {
                updated.delete(image.key)
            }

            return updated
        })
    }

    const handleClick = () => {
        window.open(imageUrl, '_blank')
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
            <div className="relative group cursor-pointer">
                <div className="absolute inset-0 flex justify-between pointer-events-none *:group-hover:block *:md:hidden">
                    <input 
                        type="checkbox" 
                        onChange={handleCheckbox} 
                        checked={selectedImages.has(image.key)} 
                        className="self-end size-6 pointer-events-auto cursor-pointer checked:block"
                    /> 
                    <div className="text-xl divide-x divide-black/25 *:cursor-pointer *:pointer-events-auto">
                        <button children={<DownloadIcon />} onClick={handleDownload} className="p-1 bg-gray-300 hover:bg-gray-400" />
                        <button children={<PencilIcon />} onClick={handleRename} className="p-1 bg-gray-300 hover:bg-gray-400" />
                        <button children={<TrashIcon />} onClick={handleDelete} className="p-1 bg-gray-300 hover:bg-gray-400" />
                    </div>
                </div>

                <img 
                    src={`${imageUrl}?preview`} 
                    className="w-full aspect-square object-cover cursor-pointer" 
                    onClick={handleClick}
                />
            </div>
            
            <p className="truncate" title={image.name}> { image.name } </p>
        </div>
    )
}

export default ImageContainer