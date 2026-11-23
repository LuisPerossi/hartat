import type { EventType } from "@hartat/types/events"

interface EventTypeFilterProps {
    selectedType?: EventType
    onChange: (type?: EventType) => void
}

function EventTypeFilter({ selectedType, onChange }: EventTypeFilterProps) {
    return (
        <label className="flex w-full md:w-auto gap-2 items-center text-sm font-medium text-gray-700 min-w-0">
            <span className="shrink-0">Tipo:</span>
            <select
                value={selectedType ?? ""}
                onChange={(e) => {
                    const value = e.target.value
                    onChange(value === "" ? undefined : (value as EventType))
                }}
                className="flex-1 md:flex-initial w-full md:w-auto min-w-0 rounded-md border border-gray-300 px-2.5 py-1.5 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            >
                <option value="">Todos os tipos</option>
                <option value="regular">Eventos Regulares</option>
                <option value="special">Eventos Especiais</option>
            </select>
        </label>
    )
}

export default EventTypeFilter
