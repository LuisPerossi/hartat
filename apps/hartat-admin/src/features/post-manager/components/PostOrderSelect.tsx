import type { SortOrder } from "../types/posts"

interface PostOrderSelectProps {
    onChange: React.Dispatch<React.SetStateAction<SortOrder>>
}

function PostOrderSelect({ onChange: setSortOrder }: PostOrderSelectProps) {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [sort, order] = e.target.value.split("-") as [SortOrder["sort"], SortOrder["order"]]
        setSortOrder({ sort, order })
    }

    return (
        <label className="flex gap-2 items-center text-sm font-medium text-gray-700">
            Ordenar:
            <select
                onChange={handleChange}
                defaultValue="date-desc"
                className="rounded-md border border-gray-300 px-2 py-1.5 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
                <option value="date-desc">Data (mais recentes)</option>
                <option value="date-asc">Data (mais antigas)</option>
                <option value="title-asc">Título (A-Z)</option>
                <option value="title-desc">Título (Z-A)</option>
            </select>
        </label>
    )
}

export default PostOrderSelect
