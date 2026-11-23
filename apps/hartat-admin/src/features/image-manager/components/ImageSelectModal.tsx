import { XIcon } from "@phosphor-icons/react"
import type { Image } from "@hartat/types/images"
import ImageManager from "./ImageManager"

interface ImageSelectModalProps {
    isOpen: boolean
    onClose: () => void
    onSelect?: (image: Image) => void
    onSelectMultiple?: (images: Image[]) => void
    multiple?: boolean
}

function ImageSelectModal({
    isOpen,
    onClose,
    onSelect,
    onSelectMultiple,
    multiple = false
}: ImageSelectModalProps) {
    if (!isOpen) return null

    const title = multiple ? "Selecionar Imagens" : "Selecionar Imagem"

    const handleConfirm = (images: Image[]) => {
        if (images.length === 0) return

        if (multiple && onSelectMultiple) {
            onSelectMultiple(images)
        } else if (onSelect) {
            onSelect(images[0])
        }
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 md:p-6">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[92dvh] md:h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50 shrink-0">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">{title}</h2>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="p-1.5 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
                        title="Fechar"
                    >
                        <XIcon className="text-2xl" />
                    </button>
                </div>

                <div className="flex-1 min-h-0 overflow-hidden p-3 sm:p-6 flex flex-col gap-3">
                    <ImageManager 
                        isModal 
                        multiple={multiple}
                        onConfirmSelection={handleConfirm}
                    />
                </div>
            </div>
        </div>
    )
}

export default ImageSelectModal
