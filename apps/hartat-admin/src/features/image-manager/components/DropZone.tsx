import { CloudArrowUpIcon } from "@phosphor-icons/react"
import { useRef, useState, type ReactNode } from "react"

interface DropZoneProps {
    onDrop: (files: FileList) => void,
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

        handleUpload(e.dataTransfer.files)
    }

    const overlay = (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/30">
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