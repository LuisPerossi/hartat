import type { EventSortOrder } from "../types/events"

interface EventOrderSelectProps {
    value: EventSortOrder
    onChange: React.Dispatch<React.SetStateAction<EventSortOrder>>
}

function EventOrderSelect({ value, onChange: setSortOrder }: EventOrderSelectProps) {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [sort, order] = e.target.value.split("-") as [EventSortOrder["sort"], EventSortOrder["order"]]
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
                <option value="dateStart-asc">Data de início (mais próximos)</option>
                <option value="dateStart-desc">Data de início (mais distantes)</option>
                <option value="dateEnd-asc">Data de término (mais próximos)</option>
                <option value="dateEnd-desc">Data de término (mais distantes)</option>
                <option value="title-asc">Nome (A-Z)</option>
                <option value="title-desc">Nome (Z-A)</option>
            </select>
        </label>
    )
}

export default EventOrderSelect
