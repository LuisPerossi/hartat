import { CloudArrowUpIcon } from "@phosphor-icons/react"

interface UploadButtonProps {
    onSelect: (files: File[]) => void
}

function UploadButton({ onSelect: handleUpload }: UploadButtonProps) {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files

        if (fileList && fileList.length !== 0) {
            const files = Array.from(fileList)
            handleUpload(files)
        }
    }

    return (
        <label className="flex w-fit gap-2 px-4 py-2 items-center rounded-full text-white bg-blue-600 hover:cursor-pointer">
            Enviar <CloudArrowUpIcon className="text-xl" />
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleChange} />
        </label>
    )
}

export default UploadButton

/*
function UploadImagesButton() {
    return (
        <label className="flex px-3 gap-2 items-center rounded-full text-white bg-blue-600 hover:cursor-pointer">
            Enviar
            <CloudArrowUpIcon className="shrink-0 text-xl" />
            <input type="file" accept="image/*" multiple className="hidden" />
        </label>
    )
}
    */