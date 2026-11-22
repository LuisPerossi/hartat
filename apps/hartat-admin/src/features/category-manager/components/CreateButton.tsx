import { PlusIcon } from "@phosphor-icons/react"

interface CreateButtonProps {
    onClick: () => void
    disabled?: boolean
}

function CreateButton({ onClick, disabled = false }: CreateButtonProps) {
    return (
        <button 
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={disabled ? "Limite máximo de 20 categorias atingido" : "Adicionar categoria"}
            className="flex w-fit gap-2 px-4 py-2 items-center rounded-full text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shrink-0 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
        >
            Adicionar <PlusIcon className="text-xl" />
        </button>
    )
}

export default CreateButton
