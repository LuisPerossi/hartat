import { MagnifyingGlassIcon } from "@phosphor-icons/react"
import { useEffect, useRef, useState } from "react"

interface SearchbarProps {
    onSearch: React.Dispatch<React.SetStateAction<string>>
}

function Searchbar({ onSearch }: SearchbarProps)  {
    const [input, setInput] = useState("")
    const onSearchRef = useRef(onSearch)
    const lastEmittedInputRef = useRef(input)

    useEffect(() => {
        onSearchRef.current = onSearch
    }, [onSearch])

    //Debounces search
    useEffect(() => {
        if (input === lastEmittedInputRef.current) return

        const timeout = setTimeout(() => {
            lastEmittedInputRef.current = input
            onSearchRef.current(input)
        }, 500)

        return () => clearTimeout(timeout)
    }, [input])

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