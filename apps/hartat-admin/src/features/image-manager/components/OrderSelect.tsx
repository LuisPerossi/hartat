import type { SortOrder } from "./ImageManager"

interface OrderSelectProps {
    onChange: React.Dispatch<React.SetStateAction<SortOrder>>
}

function OrderSelect({ onChange: setSortOrder }: OrderSelectProps) {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value.split('-')   
        const sort = value[0] as SortOrder["sort"]
        const order = value[1] as SortOrder["order"]
        setSortOrder({ sort, order })
    }

    return (
        <label className="flex gap-2 ml-auto items-center flex-wrap">
            Ordenar:
                <select onChange={handleChange} className="rounded-md border-2 border-gray-300 cursor-pointer">
                    <option value={"date-desc"}> Data (mais novos) </option>
                    <option value={"date-asc"}> Data (mais antigos) </option>
                    <option value={"name-asc"}> Nome </option>
                </select>
        </label>
    )
}

export default OrderSelect