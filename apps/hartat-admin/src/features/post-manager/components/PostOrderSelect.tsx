import type { SortOrder } from "../types/posts"

interface PostOrderSelectProps {
    value: SortOrder
    onChange: React.Dispatch<React.SetStateAction<SortOrder>>
}

function PostOrderSelect({ value, onChange: setSortOrder }: PostOrderSelectProps) {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [sort, order] = e.target.value.split("-") as [SortOrder["sort"], SortOrder["order"]]
        setSortOrder({ sort, order })
    }

    return (
        <label className="flex w-full md:w-auto gap-2 items-center text-sm font-medium text-gray-700 min-w-0">
            <span className="shrink-0">Ordenar:</span>
            <select
                value={`${value.sort}-${value.order}`}
                onChange={handleChange}
                className="flex-1 md:flex-initial w-full md:w-auto min-w-0 rounded-md border border-gray-300 px-2.5 py-1.5 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            >
                <option value="date-desc">Criação (mais recentes)</option>
                <option value="date-asc">Criação (mais antigas)</option>
                <option value="updated-desc">Modificação (mais recentes)</option>
                <option value="updated-asc">Modificação (mais antigas)</option>
                <option value="title-asc">Título (A-Z)</option>
                <option value="title-desc">Título (Z-A)</option>
            </select>
        </label>
    )
}

export default PostOrderSelect
