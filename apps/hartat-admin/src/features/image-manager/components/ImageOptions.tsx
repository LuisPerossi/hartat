import { DownloadIcon, TrashIcon } from "@phosphor-icons/react"

interface ImageOptionsProps {
    selectionMode: boolean
    setSelectionMode: React.Dispatch<React.SetStateAction<boolean>>,
    setSortOrder: React.Dispatch<React.SetStateAction<{ sort: string, order: string }>>
}

function ImageOptions({ selectionMode, setSelectionMode, setSortOrder }: ImageOptionsProps) {

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value.split('-')
        setSortOrder({ sort: value[0], order: value[1]})
    }

    return (
        <div className="flex flex-col-reverse gap-2 *:justify-end">
            <label className="flex gap-3 items-center">
                Ordenar:
                <select onChange={handleSelectChange} className="rounded-md border-2 border-gray-300">
                    <option value={"date-desc"}> Data (mais novos) </option>
                    <option value={"date-asc"}> Data (mais antigos) </option>
                    <option value={"name-asc"}> Nome </option>
                </select>
            </label>

            <div className="flex gap-3 **:items-center **:flex flex-wrap **:gap-3 **:hover:cursor-pointer">
                <label>
                    Selecionar:
                    <input type="checkbox" onChange={e => setSelectionMode(e.target.checked)} />
                </label>

                <button disabled={!selectionMode} className="order-3 px-4 py-2 rounded-md bg-gray-300 disabled:text-gray-500"> 
                    Baixar 
                    <DownloadIcon /> 
                </button>

                <button disabled={!selectionMode} className="order-2 px-4 py-2 rounded-md bg-gray-300 disabled:text-gray-500"> 
                    Excluir 
                    <TrashIcon /> 
                </button>
            </div>
        </div>
    ) 

    /*
    return (
        <div className="flex flex-col gap-3 md:flex-row-reverse md:justify-between">
            <label className="flex items-center justify-end gap-3">
                Ordenar:
                <select onChange={handleSelectChange} className="rounded-md border-2 border-gray-300 cursor-pointer">
                    <option value={"date-desc"}> Data (mais novos) </option>
                    <option value={"date-asc"}> Data (mais antigos) </option>
                    <option value={"name-asc"}> Nome </option>
                </select>
            </label>

            <div className="flex justify-between *:flex *:items-center *:gap-3 **:cursor-pointer md:gap-3">
                <label>
                    Selecionar:
                    <input type="checkbox" onChange={e => setSelectionMode(e.target.checked)} />
                </label>

                <button disabled={!selectionMode} className="px-2 rounded-md bg-gray-300 disabled:text-gray-500"> 
                    Baixar 
                    <DownloadIcon /> 
                </button>

                <button disabled={!selectionMode} className="px-2 rounded-md bg-gray-300 disabled:text-gray-500"> 
                    Excluir 
                    <TrashIcon /> 
                </button>
            </div>
        </div>
    ) */
}

export default ImageOptions