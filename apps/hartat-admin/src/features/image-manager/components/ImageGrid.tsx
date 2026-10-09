import type { Image } from "@hartat/types/images"
import ImageContainer from "./ImageContainer"

interface ImageGridProps {
    images: Image[],
    selectedImages: Map<string, Image>,
    setSelectedImages: React.Dispatch<React.SetStateAction<Map<string, Image>>>,
    setForceReload: React.Dispatch<React.SetStateAction<number>>
}

function ImageGrid({ images, selectedImages, setSelectedImages, setForceReload}: ImageGridProps) {
    return (
        <div className="flex-1 p-5 md:overflow-y-scroll">
            <div className="flex-1 gap-5 content-start grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))]">
                {images.map(image => (
                    <ImageContainer 
                        key={image.key} 
                        image={image} 
                        selectedImages={selectedImages} 
                        setSelectedImages={setSelectedImages} 
                        setForceReload={setForceReload} 
                    />
                ))}
            </div>
        </div>
    )
}

export default ImageGrid
