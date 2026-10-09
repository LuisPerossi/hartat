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
        <div className="relative flex flex-1 min-w-30 items-center">
            <input 
                placeholder="Buscar..." 
                onChange={e => setInput(e.target.value)} 
                className="flex-1 min-w-0 px-4 py-2 rounded-full border-2 border-gray-300 focus:outline-none"
            />
            <MagnifyingGlassIcon 
                className="absolute right-3 text-xl text-gray-700 pointer-events-none" 
            />
        </div>
    )
}

export default Searchbar

/*
 return (
        <div className="relative flex grow min-w-0 items-center">
            <input 
                placeholder="Buscar..." 
                onChange={e => setInput(e.target.value)} 
                className="relative grow min-w-0 py-2 px-4 rounded-full border-2 border-gray-300 focus:outline-none"
            />
            <MagnifyingGlassIcon 
                className="absolute shrink-0 right-3 text-xl text-gray-700 pointer-events-none" 
            />
        </div>
    )
        */