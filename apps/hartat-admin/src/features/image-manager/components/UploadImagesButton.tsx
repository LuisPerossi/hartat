import { CloudArrowUpIcon } from "@phosphor-icons/react"

function UploadImagesButton() {
    return (
        <label className="flex shrink-0 items-center px-3 gap-2 rounded-full whitespace-nowrap text-white bg-blue-600 hover:cursor-pointer">
            Enviar Imagens
            <CloudArrowUpIcon className="shrink-0" />
            <input type="file" accept=".jpg, .jpeg, .png, .webp" multiple className="hidden" />
        </label>
    )
}

export default UploadImagesButton