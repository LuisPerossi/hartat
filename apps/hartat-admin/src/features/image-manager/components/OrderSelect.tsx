import type { SortOrder } from "../types/images"

interface OrderSelectProps {
    value: SortOrder
    onChange: React.Dispatch<React.SetStateAction<SortOrder>>
}

function OrderSelect({ value, onChange: setSortOrder }: OrderSelectProps) {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [sort, order] = e.target.value.split("-") as [SortOrder["sort"], SortOrder["order"]]
        setSortOrder({ sort, order })
    }

    return (
        <label className="flex w-full gap-2 items-center text-sm font-medium text-gray-700 md:w-auto">
            <span className="shrink-0">Ordenar:</span>
            <select
                value={`${value.sort}-${value.order}`}
                onChange={handleChange}
                className="flex-1 min-w-0 rounded-md border border-gray-300 px-2 py-1.5 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 md:flex-none"
            >
                <option value="date-desc">Data (mais recentes)</option>
                <option value="date-asc">Data (mais antigas)</option>
                <option value="name-asc">Nome (A-Z)</option>
            </select>
        </label>
    )
}

export default OrderSelect