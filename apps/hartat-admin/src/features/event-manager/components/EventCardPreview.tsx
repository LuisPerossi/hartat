import { CalendarBlankIcon, ImageIcon, InfoIcon, LinkIcon, SparkleIcon } from "@phosphor-icons/react"
import { API_URL } from "@/config/env"
import type { EventType } from "@hartat/types/events"
import { formatDisplayUrl, formatEventScheduleFromInputs } from "../utils/format"

interface EventCardPreviewProps {
    title: string
    description: string
    type: EventType
    url: string
    dateStart: string
    dateEnd: string
    timeStart: string
    timeEnd: string
    imageKey?: string
    imageName?: string
}

function EventCardPreview({
    title,
    description,
    type,
    url,
    dateStart,
    dateEnd,
    timeStart,
    timeEnd,
    imageKey,
    imageName
}: EventCardPreviewProps) {
    const trimmedDescription = description.trim()
    const trimmedUrl = url.trim()
    const effectiveEndDate = type === "regular" ? dateStart : dateEnd

    return (
        <div className="flex flex-col sm:flex-row rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden w-full max-w-2xl mx-auto">
            {/* Cover Image */}
            <div className="sm:w-56 md:w-64 shrink-0 bg-gray-100 flex items-center justify-center aspect-square">
                {imageKey ? (
                    <img
                        src={`${API_URL}/images/${imageKey}`}
                        alt={imageName || title || "Capa do evento"}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center gap-1 text-gray-400 p-6 text-center">
                        <ImageIcon className="text-4xl" />
                        <span className="text-xs">Sem imagem de capa</span>
                    </div>
                )}
            </div>

            {/* Event Details */}
            <div className="flex flex-col gap-3 p-5 flex-1 min-w-0 justify-center">
                <div className="flex flex-col gap-1.5">
                    <span
                        className={`inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-xs font-medium ${
                            type === "special"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-700"
                        }`}
                    >
                        {type === "special" && <SparkleIcon className="text-xs shrink-0" />}
                        {type === "special" ? "Evento Especial" : "Evento Regular"}
                    </span>

                    <h3 className="text-xl font-semibold text-gray-900 leading-snug wrap-break-word">
                        {title.trim() || "Nome do Evento"}
                    </h3>
                </div>

                <div className="flex flex-col gap-2 text-sm text-gray-700">
                    <div className="flex items-start gap-2">
                        <CalendarBlankIcon className="text-lg text-gray-700 shrink-0 mt-0.5" />
                        <p className="leading-snug">
                            <span className="font-semibold text-gray-900">Data: </span>
                            {dateStart || effectiveEndDate
                                ? formatEventScheduleFromInputs(dateStart, effectiveEndDate, timeStart, timeEnd)
                                : type === "special"
                                  ? "DD/MM/AAAA - DD/MM/AAAA"
                                  : "DD/MM/AAAA"}
                        </p>
                    </div>

                    {trimmedDescription && (
                        <div className="flex items-start gap-2">
                            <InfoIcon className="text-lg text-gray-700 shrink-0 mt-0.5" />
                            <p className="leading-snug wrap-break-word">
                                <span className="font-semibold text-gray-900">Informações: </span>
                                {trimmedDescription}
                            </p>
                        </div>
                    )}

                    {trimmedUrl && (
                        <div className="flex items-start gap-2">
                            <LinkIcon className="text-lg text-gray-700 shrink-0 mt-0.5" />
                            <p className="leading-snug min-w-0 break-all">
                                <span className="font-semibold text-gray-900">Link: </span>
                                <a
                                    href={trimmedUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    {formatDisplayUrl(trimmedUrl)}
                                </a>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default EventCardPreview
