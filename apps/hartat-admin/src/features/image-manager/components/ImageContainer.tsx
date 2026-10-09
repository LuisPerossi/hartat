import { DownloadIcon, PencilIcon, TrashIcon } from "@phosphor-icons/react"

import type { ChangeEvent } from "react"
import type { Image } from "@hartat/types/images"

import { deleteImage } from "../utils/images"
import { renameImage } from "../utils/images"
import { downloadImage } from "../utils/images"

interface ImageContainerProps {
    apiUrl: string,
    image: Image,
    selectedImages: Map<string, Image>,
    setSelectedImages: React.Dispatch<React.SetStateAction<Map<string, Image>>>,
    setForceReload: React.Dispatch<React.SetStateAction<number>>
}

function ImageContainer({ apiUrl, image, selectedImages, setSelectedImages, setForceReload }: ImageContainerProps) {
    const imageUrl = `${apiUrl}/admin/images/${image.key}`

    const handleCheckbox = (e: ChangeEvent<HTMLInputElement>) => {
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
        downloadImage({ image, imageUrl })
    }

    const handleRename = () => {
        renameImage({ image, apiUrl, setForceReload})
    }

    const handleDelete = () => {
        deleteImage({ image, apiUrl, setForceReload })
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