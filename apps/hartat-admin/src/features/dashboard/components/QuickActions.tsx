import { Link } from "react-router-dom"
import { PlusIcon } from "@phosphor-icons/react"

function QuickActions() {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

            <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:items-center">
                <Link
                    to="/posts/new"
                    className="flex justify-center gap-2 px-4 py-2 items-center rounded-full text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shrink-0 sm:w-fit"
                >
                    Nova Postagem <PlusIcon className="text-lg shrink-0" />
                </Link>

                <Link
                    to="/events/new"
                    className="flex justify-center gap-2 px-4 py-2 items-center rounded-full text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors shrink-0 sm:w-fit"
                >
                    Novo Evento <PlusIcon className="text-lg shrink-0" />
                </Link>
            </div>
        </div>
    )
}

export default QuickActions
