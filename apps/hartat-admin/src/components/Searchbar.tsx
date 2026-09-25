import { MagnifyingGlassIcon } from "@phosphor-icons/react"
import { useEffect, useState } from "react"

interface SearchbarProps {
    onSearch: React.Dispatch<React.SetStateAction<string>>
}

function Searchbar({ onSearch: setSearch }: SearchbarProps)  {
    const [input, setInput] = useState("")
    
    //Debounces search
    useEffect(() => {
        const timeout = setTimeout(() => {
            setSearch(input)
        }, 500)

        return () => clearTimeout(timeout)
    }, [input, setSearch])

    return (
        <div className="flex min-w-0 grow items-center py-2 px-4 rounded-full border-2 border-gray-300">
            <input placeholder="Buscar..." onChange={(e) => setInput(e.target.value)} className="min-w-0 grow focus:outline-none" />
            <MagnifyingGlassIcon className="shrink-0 text-gray-700" />
        </div>
    )
}

export default Searchbar