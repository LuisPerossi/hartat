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

        e.target.value = ""
    }

    return (
        <label className="flex w-fit gap-2 px-4 py-2 items-center rounded-full text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shrink-0 transition-colors">
            Enviar <CloudArrowUpIcon className="text-xl" />
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleChange} />
        </label>
    )
}

export default UploadButton