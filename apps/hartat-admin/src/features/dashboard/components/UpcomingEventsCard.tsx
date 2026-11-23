import { Link } from "react-router-dom"
import { ArrowRightIcon, CalendarBlankIcon, ImageIcon, PencilIcon } from "@phosphor-icons/react"
import { API_URL } from "@/config/env"
import type { Event } from "@hartat/types/events"
import { formatEventSchedule, getEventStatus } from "@/features/event-manager/utils/format"

interface UpcomingEventsCardProps {
    events: Event[]
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

function UpcomingEventsCard({ events }: UpcomingEventsCardProps) {
    return (
        <section className="flex flex-col border border-gray-300 rounded-lg bg-white overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gray-100 border-b border-gray-300">
                <h2 className="text-sm font-semibold text-gray-800">Próximos Eventos</h2>
                <Link
                    to="/events"
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                >
                    Ver todos <ArrowRightIcon className="text-xs" />
                </Link>
            </div>

            {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center text-gray-500">
                    <p className="text-sm">Nenhum evento próximo.</p>
                    <Link
                        to="/events/new"
                        className="text-xs font-medium text-blue-600 hover:underline"
                    >
                        Criar primeiro evento
                    </Link>
                </div>
            ) : (
                <ul className="divide-y divide-gray-200">
                    {events.map((event) => {
                        const status = getEventStatus(event.dateStart, event.dateEnd)
                        const statusBadge = STATUS_BADGE[status]
                        const typeBadge = TYPE_BADGE[event.type === "special" ? "special" : "regular"]

                        return (
                            <li
                                key={event.id}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                            >
                                {event.image?.key ? (
                                    <img
                                        src={`${API_URL}/images/${event.image.key}?preview`}
                                        alt={event.title}
                                        className="w-11 h-11 min-w-11 aspect-square rounded object-cover border border-gray-200 shrink-0"
                                    />
                                ) : (
                                    <div className="w-11 h-11 min-w-11 aspect-square rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                                        <ImageIcon className="text-lg" />
                                    </div>
                                )}

                                <div className="flex flex-col min-w-0 flex-1 gap-1">
                                    <Link
                                        to={`/events/edit/${event.id}`}
                                        className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate transition-colors"
                                    >
                                        {event.title}
                                    </Link>

                                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                                        <span className="inline-flex items-center gap-1">
                                            <CalendarBlankIcon className="text-sm shrink-0" />
                                            {formatEventSchedule(event.dateStart, event.dateEnd)}
                                        </span>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${statusBadge.className}`}>
                                            {statusBadge.label}
                                        </span>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${typeBadge.className}`}>
                                            {typeBadge.label}
                                        </span>
                                    </div>
                                </div>

                                <Link
                                    to={`/events/edit/${event.id}`}
                                    title="Editar evento"
                                    className="p-1.5 rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors shrink-0"
                                >
                                    <PencilIcon className="text-base" />
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            )}
        </section>
    )
}

export default UpcomingEventsCard
