import { Link } from "react-router-dom"
import { ArrowSquareOutIcon, CalendarBlankIcon, ImageIcon, PencilIcon, TrashIcon } from "@phosphor-icons/react"
import { API_URL } from "@/config/env"
import type { Event } from "@hartat/types/events"
import { deleteEvent } from "../utils/events"
import { formatDisplayUrl, formatEventSchedule, getEventStatus } from "../utils/format"

interface EventListProps {
    events: Event[]
    emptyMessage: string
    onDeleted: () => void
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
}

const STATUS_BADGE = {
    ongoing: {
        label: "Em andamento",
        className: "bg-green-100 text-green-800"
    },
    upcoming: {
        label: "Próximo",
        className: "bg-blue-100 text-blue-800"
    },
    past: {
        label: "Arquivado",
        className: "bg-gray-200 text-gray-700"
    }
} as const

const TYPE_BADGE = {
    special: {
        label: "Especial",
        className: "bg-amber-100 text-amber-800"
    },
    regular: {
        label: "Regular",
        className: "bg-slate-100 text-slate-700"
    }
} as const

function EventList({ events, emptyMessage, onDeleted, setIsLoading }: EventListProps) {
    const handleDelete = async (event: Event) => {
        const confirm = window.confirm(`Tem certeza que deseja excluir o evento "${event.title}"?`)
        if (!confirm) return

        setIsLoading(true)

        try {
            await deleteEvent(event.id)
            onDeleted()
        } catch (err: unknown) {
            console.error(err)
            const message = err instanceof Error ? err.message : "Erro ao excluir evento"
            window.alert(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-2 flex-1">
            {/* Desktop Table (matches PostList & CategoryList design) */}
            <div className="hidden md:block overflow-x-auto border border-gray-300 rounded-lg">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="divide-x divide-gray-200 bg-gray-100 border-b border-gray-300 text-sm font-semibold text-gray-700">
                            <th className="py-3 px-4 w-20 text-center">Capa</th>
                            <th className="py-3 px-4 w-full">Evento</th>
                            <th className="py-3 px-4 text-center whitespace-nowrap">Tipo</th>
                            <th className="py-3 px-4 text-center whitespace-nowrap">Data / Horário</th>
                            <th className="py-3 px-4 text-center whitespace-nowrap">Status</th>
                            <th className="py-3 px-4 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-gray-500">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            events.map((event) => {
                                const status = getEventStatus(event.dateStart, event.dateEnd)
                                const statusBadge = STATUS_BADGE[status]
                                const typeBadge = TYPE_BADGE[event.type === "special" ? "special" : "regular"]

                                return (
                                    <tr key={event.id} className="divide-x divide-gray-200 hover:bg-gray-50 transition-colors">
                                        {/* Capa (1:1 square matching PostList) */}
                                        <td className="py-3 px-4 text-center">
                                            {event.image?.key ? (
                                                <img
                                                    src={`${API_URL}/images/${event.image.key}?preview`}
                                                    alt={event.title}
                                                    className="w-12 h-12 min-w-12 aspect-square rounded object-cover mx-auto border border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 min-w-12 aspect-square rounded bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto text-gray-400">
                                                    <ImageIcon className="text-xl" />
                                                </div>
                                            )}
                                        </td>

                                        {/* Evento (Título, descrição opcional e link) */}
                                        <td className="py-3 px-4 max-w-md">
                                            <div className="flex flex-col min-w-0 gap-0.5">
                                                <Link
                                                    to={`/events/edit/${event.id}`}
                                                    className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                                                >
                                                    {event.title}
                                                </Link>
                                                {event.description && (
                                                    <p className="text-xs text-gray-500 line-clamp-2">
                                                        {event.description}
                                                    </p>
                                                )}
                                                {event.url && (
                                                    <a
                                                        href={event.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline truncate w-fit max-w-full mt-0.5"
                                                    >
                                                        <span className="truncate">{formatDisplayUrl(event.url)}</span>
                                                        <ArrowSquareOutIcon className="text-xs shrink-0" />
                                                    </a>
                                                )}
                                            </div>
                                        </td>

                                        {/* Tipo */}
                                        <td className="py-3 px-4 text-center whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeBadge.className}`}>
                                                {typeBadge.label}
                                            </span>
                                        </td>

                                        {/* Data / Horário */}
                                        <td className="py-3 px-4 text-sm text-gray-600 text-center whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5">
                                                <CalendarBlankIcon className="text-base text-gray-500 shrink-0" />
                                                {formatEventSchedule(event.dateStart, event.dateEnd)}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="py-3 px-4 text-center whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.className}`}>
                                                {statusBadge.label}
                                            </span>
                                        </td>

                                        {/* Ações */}
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end items-center gap-1">
                                                <Link
                                                    to={`/events/edit/${event.id}`}
                                                    title="Editar evento"
                                                    className="p-1.5 rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer transition-colors"
                                                >
                                                    <PencilIcon className="text-lg" />
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(event)}
                                                    title="Excluir evento"
                                                    className="p-1.5 rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer transition-colors"
                                                >
                                                    <TrashIcon className="text-lg" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden border border-gray-300 rounded-lg divide-y divide-gray-200 overflow-hidden">
                {events.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                        {emptyMessage}
                    </div>
                ) : (
                    events.map((event) => {
                        const status = getEventStatus(event.dateStart, event.dateEnd)
                        const statusBadge = STATUS_BADGE[status]
                        const typeBadge = TYPE_BADGE[event.type === "special" ? "special" : "regular"]

                        return (
                            <div key={event.id} className="p-3 flex flex-col gap-2.5 bg-white">
                                <div className="flex items-start gap-3">
                                    {event.image?.key ? (
                                        <img
                                            src={`${API_URL}/images/${event.image.key}?preview`}
                                            alt={event.title}
                                            className="w-14 h-14 min-w-14 aspect-square rounded object-cover shrink-0 border border-gray-200"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 min-w-14 aspect-square rounded bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 text-gray-400">
                                            <ImageIcon className="text-xl" />
                                        </div>
                                    )}

                                    <div className="flex flex-col min-w-0 flex-1 gap-1">
                                        <Link
                                            to={`/events/edit/${event.id}`}
                                            className="font-medium text-gray-900 hover:text-blue-600 transition-colors leading-snug wrap-break-word"
                                        >
                                            {event.title}
                                        </Link>
                                        {event.description && (
                                            <p className="text-xs text-gray-500 line-clamp-2">
                                                {event.description}
                                            </p>
                                        )}
                                        {event.url && (
                                            <a
                                                href={event.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline truncate"
                                            >
                                                <span className="truncate">{formatDisplayUrl(event.url)}</span>
                                                <ArrowSquareOutIcon className="text-xs shrink-0" />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                                    <div className="flex flex-col gap-1.5 text-xs text-gray-600">
                                        <span className="inline-flex items-center gap-1">
                                            <CalendarBlankIcon className="text-sm shrink-0" />
                                            {formatEventSchedule(event.dateStart, event.dateEnd)}
                                        </span>
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeBadge.className}`}>
                                                {typeBadge.label}
                                            </span>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.className}`}>
                                                {statusBadge.label}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        <Link
                                            to={`/events/edit/${event.id}`}
                                            title="Editar evento"
                                            className="p-1.5 rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer transition-colors"
                                        >
                                            <PencilIcon className="text-lg" />
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(event)}
                                            title="Excluir evento"
                                            className="p-1.5 rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer transition-colors"
                                        >
                                            <TrashIcon className="text-lg" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default EventList
