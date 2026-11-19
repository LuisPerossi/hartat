import { PlusIcon } from "@phosphor-icons/react"
import { createCategory } from "../utils/categories/create"

interface CreateButtonProps {
    onCreated: () => void,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
}

function CreateButton({ onCreated, setIsLoading }: CreateButtonProps) {
    const handleCreate = async () => {
        const input = window.prompt('Digite o nome da nova categoria:')

        if (input === null) { return }

        const trimmed = input.trim()
        if (trimmed.length === 0) {
            return window.alert('O nome da categoria não pode ser vazio')
        }
        if (trimmed.length > 20) {
            return window.alert('O nome da categoria deve ter no máximo 20 caracteres')
        }

        setIsLoading(true)

        try {
            await createCategory({ name: trimmed })
            onCreated()
        } catch (err: unknown) {
            console.error(err)
            const message = err instanceof Error ? err.message : 'Erro ao criar categoria'
            window.alert(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button 
            type="button"
            onClick={handleCreate}
            className="flex w-fit gap-2 px-4 py-2 items-center rounded-full text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shrink-0"
        >
            Adicionar <PlusIcon className="text-xl" />
        </button>
    )
}

export default CreateButton
