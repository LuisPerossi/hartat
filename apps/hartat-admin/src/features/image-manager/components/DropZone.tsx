import { useRef, useState, type ReactNode } from "react"
import { CloudArrowUpIcon } from "@phosphor-icons/react"

interface DropZoneProps {
    onDrop: (files: File[]) => void,
    children?: ReactNode
}

function DropZone({ children, onDrop: handleUpload }: DropZoneProps) {
    const [ isDragging, setIsDragging ] = useState(false)
    const dragCounter = useRef(0)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault()
        if (e.dataTransfer.types.includes('Files') === false) { return }

        dragCounter.current++
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        dragCounter.current--

        if (dragCounter.current === 0) {
            setIsDragging(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()

        dragCounter.current = 0
        setIsDragging(false)

        const files = Array.from(e.dataTransfer.files)
        handleUpload(files)
    }

    const overlay = (
        <div className="absolute flex inset-0 z-50 flex-col items-center justify-center text-white bg-black/30">
            <CloudArrowUpIcon className="text-6xl" />
            <p className="text-xl" > Arraste imagens para enviar. </p>
        </div>
    )

    return (
        <div 
            className="relative flex flex-1" 
            onDragOver={handleDragOver} 
            onDragEnter={handleDragEnter} 
            onDragLeave={handleDragLeave} 
            onDrop={handleDrop}
        >
            { isDragging && overlay }
            { children }
        </div>
    )
}

export default DropZone