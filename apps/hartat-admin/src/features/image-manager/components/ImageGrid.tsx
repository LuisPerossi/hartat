import type { Image } from "@hartat/types/images"
import ImageContainer from "./ImageContainer"

interface ImageGridProps {
    images: Image[],
    selectedImages: Map<string, Image>,
    setSelectedImages: React.Dispatch<React.SetStateAction<Map<string, Image>>>,
    setForceReload: React.Dispatch<React.SetStateAction<number>>,
    isModal?: boolean,
    multiple?: boolean
}

function ImageGrid({ images, selectedImages, setSelectedImages, setForceReload, isModal, multiple }: ImageGridProps) {
    return (
        <div className="flex-1 p-4 border border-gray-300 rounded-lg bg-white md:overflow-y-auto">
            {images.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                    Nenhuma imagem encontrada
                </div>
            ) : (
                <div className="flex-1 gap-4 content-start grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))]">
                    {images.map(image => (
                        <ImageContainer
                            key={image.key}
                            image={image}
                            selectedImages={selectedImages}
                            setSelectedImages={setSelectedImages}
                            setForceReload={setForceReload}
                            isModal={isModal}
                            multiple={multiple}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default ImageGrid
