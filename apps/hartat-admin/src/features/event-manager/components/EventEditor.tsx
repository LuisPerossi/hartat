import { useEffect, useMemo, useRef, useState } from "react"
import { useBlocker, useNavigate } from "react-router-dom"
import { ArrowLeftIcon, CalendarBlankIcon, FloppyDiskIcon, ImageIcon, SparkleIcon, TrashIcon } from "@phosphor-icons/react"
import { API_URL } from "@/config/env"
import type { Event, EventType } from "@hartat/types/events"
import type { Image } from "@hartat/types/images"
import ImageSelectModal from "@/features/image-manager/components/ImageSelectModal"
import LoadingSpinner from "@/components/LoadingSpinner"
import EventCardPreview from "./EventCardPreview"
import { createEvent, updateEvent } from "../utils/events"
import { toDateInputValue, toEventDateTimeIso, toTimeInputValue } from "../utils/format"

interface EventEditorProps {
    initialEvent?: Event | null
    isEditing?: boolean
}

function EventEditor({ initialEvent, isEditing = false }: EventEditorProps) {
    const navigate = useNavigate()

    const [isLoading, setIsLoading] = useState(false)

    // Form fields
    const [title, setTitle] = useState(initialEvent?.title || "")
    const [description, setDescription] = useState(initialEvent?.description || "")
    const [type, setType] = useState<EventType>(initialEvent?.type === "special" ? "special" : "regular")
    const [url, setUrl] = useState(initialEvent?.url || "")
    const [dateStart, setDateStart] = useState(() => toDateInputValue(initialEvent?.dateStart))
    const [dateEnd, setDateEnd] = useState(() => toDateInputValue(initialEvent?.dateEnd))
    const [timeStart, setTimeStart] = useState(() => toTimeInputValue(initialEvent?.dateStart, false))
    const [timeEnd, setTimeEnd] = useState(() => toTimeInputValue(initialEvent?.dateEnd, true))
    const [urlError, setUrlError] = useState<string | null>(null)
    const [dateError, setDateError] = useState<string | null>(null)

    // Cover image
    const [selectedCover, setSelectedCover] = useState<{
        id: number
        key: string
        name: string
    } | null>(() => {
        if (initialEvent?.image) {
            return {
                id: initialEvent.image.id,
                key: initialEvent.image.key,
                name: initialEvent.image.name
            }
        }
        if (initialEvent?.imageId) {
            return { id: initialEvent.imageId, key: "", name: "Imagem selecionada" }
        }
        return null
    })

    const [isCoverModalOpen, setIsCoverModalOpen] = useState(false)
    const bypassBlockerRef = useRef(false)

    // Initial snapshot for dirty tracking
    const initialSnapshot = useMemo(
        () => ({
            title: initialEvent?.title || "",
            description: initialEvent?.description || "",
            type: initialEvent?.type === "special" ? "special" : "regular",
            url: initialEvent?.url || "",
            dateStart: toDateInputValue(initialEvent?.dateStart),
            dateEnd: toDateInputValue(initialEvent?.dateEnd),
            timeStart: toTimeInputValue(initialEvent?.dateStart, false),
            timeEnd: toTimeInputValue(initialEvent?.dateEnd, true),
            imageId: initialEvent?.image?.id ?? initialEvent?.imageId ?? null
        }),
        [initialEvent]
    )

    const isDirty = useMemo(() => {
        const effectiveDateEnd = type === "regular" ? dateStart : dateEnd
        return (
            title !== initialSnapshot.title ||
            description !== initialSnapshot.description ||
            type !== initialSnapshot.type ||
            url !== initialSnapshot.url ||
            dateStart !== initialSnapshot.dateStart ||
            effectiveDateEnd !== initialSnapshot.dateEnd ||
            timeStart !== initialSnapshot.timeStart ||
            timeEnd !== initialSnapshot.timeEnd ||
            (selectedCover?.id ?? null) !== initialSnapshot.imageId
        )
    }, [title, description, type, url, dateStart, dateEnd, timeStart, timeEnd, selectedCover, initialSnapshot])

    // Block browser tab close / reload when there are unsaved changes
    useEffect(() => {
        if (!isDirty) return

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (bypassBlockerRef.current) return
            e.preventDefault()
            e.returnValue = ""
        }

        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [isDirty])

    // Block in-app navigation when there are unsaved changes
    const blocker = useBlocker(() => {
        if (bypassBlockerRef.current) return false
        return isDirty
    })

    useEffect(() => {
        if (blocker.state === "blocked") {
            const shouldLeave = window.confirm(
                "Você tem alterações não salvas. Deseja sair mesmo assim?"
            )
            if (shouldLeave) {
                blocker.proceed()
            } else {
                blocker.reset()
            }
        }
    }, [blocker])

    const handleSelectCover = (image: Image) => {
        setSelectedCover({
            id: image.id,
            key: image.key,
            name: image.name
        })
    }

    const handleRemoveCover = () => {
        setSelectedCover(null)
    }

    const handleTypeChange = (nextType: EventType) => {
        setType(nextType)
        setDateError(null)
        if (nextType === "regular") {
            setDateEnd(dateStart)
        } else if (!dateEnd && dateStart) {
            setDateEnd(dateStart)
        }
    }

    const handleDateStartChange = (value: string) => {
        setDateStart(value)
        setDateError(null)
        if (type === "regular" || !dateEnd || value > dateEnd) {
            setDateEnd(value)
        }
    }

    const handleDateEndChange = (value: string) => {
        setDateEnd(value)
        if (dateStart && value && value < dateStart) {
            setDateError("A data de término não pode ser anterior à data de início.")
        } else {
            setDateError(null)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setUrlError(null)
        setDateError(null)

        const trimmedTitle = title.trim()
        if (!trimmedTitle) {
            return window.alert("O nome do evento é obrigatório.")
        }

        if (trimmedTitle.length > 100) {
            return window.alert("O nome do evento não pode ter mais de 100 caracteres.")
        }

        const effectiveEndDate = type === "regular" ? dateStart : dateEnd

        if (!dateStart || !effectiveEndDate) {
            setDateError(
                type === "regular"
                    ? "Informe a data do evento."
                    : "Informe as datas de início e término do evento."
            )
            return
        }

        if (effectiveEndDate < dateStart) {
            setDateError("A data de término não pode ser anterior à data de início.")
            return
        }

        const startIso = toEventDateTimeIso(dateStart, timeStart, false)
        const endIso = toEventDateTimeIso(effectiveEndDate, timeEnd, true)

        if (new Date(endIso) < new Date(startIso)) {
            setDateError("O horário de término não pode ser anterior ao horário de início.")
            return
        }

        const trimmedUrl = url.trim()
        if (trimmedUrl) {
            try {
                new URL(trimmedUrl)
            } catch {
                setUrlError("Informe uma URL válida (ex: https://exemplo.com.br/evento).")
                return
            }
        }

        setIsLoading(true)

        try {
            const payload = {
                title: trimmedTitle,
                description: description.trim(),
                type,
                url: trimmedUrl || null,
                dateStart: startIso,
                dateEnd: endIso,
                imageId: selectedCover?.id ?? null
            }

            if (isEditing && initialEvent) {
                await updateEvent(initialEvent.id, payload)
                bypassBlockerRef.current = true
                window.alert("Evento atualizado com sucesso!")
            } else {
                await createEvent(payload)
                bypassBlockerRef.current = true
                window.alert("Evento criado com sucesso!")
            }

            navigate("/events")
        } catch (err: unknown) {
            console.error(err)
            const message = err instanceof Error ? err.message : "Erro ao salvar evento"
            window.alert(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-5 max-w-5xl w-full min-w-0 mx-auto pb-12">
            {isLoading && <LoadingSpinner />}

            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/events")}
                        className="p-2 rounded-full hover:bg-gray-200 text-gray-700 cursor-pointer transition-colors"
                        title="Voltar para eventos"
                    >
                        <ArrowLeftIcon className="text-xl" />
                    </button>
                    <h1 className="text-2xl font-bold">
                        {isEditing ? "Editar Evento" : "Novo Evento"}
                    </h1>
                </div>

                <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer transition-colors"
                >
                    <FloppyDiskIcon className="text-lg" />
                    {isEditing ? "Salvar Alterações" : "Criar Evento"}
                </button>
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-5 bg-white p-5 md:p-6 rounded-lg border border-gray-300 min-w-0"
            >
                {/* Cover Image Section */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                        Imagem de Capa
                    </label>

                    {selectedCover ? (
                        <div className="relative group rounded-lg overflow-hidden border border-gray-300 max-h-80 bg-gray-100 flex items-center justify-center">
                            {selectedCover.key ? (
                                <img
                                    src={`${API_URL}/images/${selectedCover.key}`}
                                    alt={selectedCover.name}
                                    className="w-full h-64 object-cover"
                                />
                            ) : (
                                <div className="p-8 text-gray-500">Imagem #{selectedCover.id}</div>
                            )}

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCoverModalOpen(true)}
                                    className="px-4 py-2 bg-white text-gray-800 rounded-lg font-medium shadow-md hover:bg-gray-100 cursor-pointer transition-colors"
                                >
                                    Alterar Imagem
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRemoveCover}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium shadow-md hover:bg-red-700 cursor-pointer transition-colors flex items-center gap-1"
                                >
                                    <TrashIcon className="text-lg" />
                                    Remover
                                </button>
                            </div>

                            <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2.5 py-1 rounded backdrop-blur-xs">
                                {selectedCover.name || "Capa selecionada"}
                            </span>
                        </div>
                    ) : (
                        <div
                            onClick={() => setIsCoverModalOpen(true)}
                            className="border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/30 rounded-lg p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
                        >
                            <div className="p-3 bg-gray-100 rounded-full text-gray-600">
                                <ImageIcon className="text-3xl" />
                            </div>
                            <span className="font-medium text-gray-700">
                                Clique para definir uma imagem de capa
                            </span>
                            <span className="text-xs text-gray-500">
                                Escolha entre as imagens cadastradas no sistema
                            </span>
                        </div>
                    )}
                </div>

                {/* Event Type Selector */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                        Tipo de Evento <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => handleTypeChange("regular")}
                            className={`flex items-start gap-3 p-3.5 rounded-lg border text-left cursor-pointer transition-colors ${
                                type === "regular"
                                    ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-600"
                                    : "border-gray-300 bg-white hover:bg-gray-50"
                            }`}
                        >
                            <CalendarBlankIcon
                                className={`text-xl shrink-0 mt-0.5 ${
                                    type === "regular" ? "text-blue-600" : "text-gray-500"
                                }`}
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-900">
                                    Evento Regular / Diário
                                </span>
                                <span className="text-xs text-gray-500">
                                    Acontece em um único dia, com horário opcional.
                                </span>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleTypeChange("special")}
                            className={`flex items-start gap-3 p-3.5 rounded-lg border text-left cursor-pointer transition-colors ${
                                type === "special"
                                    ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-600"
                                    : "border-gray-300 bg-white hover:bg-gray-50"
                            }`}
                        >
                            <SparkleIcon
                                className={`text-xl shrink-0 mt-0.5 ${
                                    type === "special" ? "text-blue-600" : "text-gray-500"
                                }`}
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-900">
                                    Evento Especial
                                </span>
                                <span className="text-xs text-gray-500">
                                    Pode durar vários dias ou meses (ex: exposições, temporadas).
                                </span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Event Name */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                        <label htmlFor="event-title" className="text-sm font-semibold text-gray-700">
                            Nome do Evento <span className="text-red-500">*</span>
                        </label>
                        <span className={`text-xs ${title.length > 90 ? "text-amber-600 font-semibold" : "text-gray-500"}`}>
                            {title.length}/100
                        </span>
                    </div>
                    <input
                        id="event-title"
                        type="text"
                        maxLength={100}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: Exposição de Arte Contemporânea"
                        className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 font-medium"
                        required
                    />
                </div>

                {/* Dates & Optional Times */}
                <div className="flex flex-col gap-3">
                    {type === "regular" ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="event-date-start" className="text-sm font-semibold text-gray-700">
                                    Data do Evento <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="event-date-start"
                                    type="date"
                                    value={dateStart}
                                    onChange={(e) => handleDateStartChange(e.target.value)}
                                    className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-1 text-gray-800 bg-white ${
                                        dateError
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                    }`}
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="event-time-start" className="text-sm font-semibold text-gray-700">
                                    Horário de Início <span className="text-xs font-normal text-gray-500">(opcional)</span>
                                </label>
                                <input
                                    id="event-time-start"
                                    type="time"
                                    value={timeStart}
                                    onChange={(e) => {
                                        setTimeStart(e.target.value)
                                        setDateError(null)
                                    }}
                                    className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-1 text-gray-800 bg-white ${
                                        dateError
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                    }`}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="event-time-end" className="text-sm font-semibold text-gray-700">
                                    Horário de Término <span className="text-xs font-normal text-gray-500">(opcional)</span>
                                </label>
                                <input
                                    id="event-time-end"
                                    type="time"
                                    value={timeEnd}
                                    onChange={(e) => {
                                        setTimeEnd(e.target.value)
                                        setDateError(null)
                                    }}
                                    className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-1 text-gray-800 bg-white ${
                                        dateError
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                    }`}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="event-date-start" className="text-sm font-semibold text-gray-700">
                                        Data de Início <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="event-date-start"
                                        type="date"
                                        value={dateStart}
                                        onChange={(e) => handleDateStartChange(e.target.value)}
                                        className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-1 text-gray-800 bg-white ${
                                            dateError
                                                ? "border-red-500 focus:ring-red-500"
                                                : "border-gray-300 focus:ring-blue-500"
                                        }`}
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="event-time-start" className="text-sm font-semibold text-gray-700">
                                        Horário Início <span className="text-xs font-normal text-gray-500">(opcional)</span>
                                    </label>
                                    <input
                                        id="event-time-start"
                                        type="time"
                                        value={timeStart}
                                        onChange={(e) => {
                                            setTimeStart(e.target.value)
                                            setDateError(null)
                                        }}
                                        className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-1 text-gray-800 bg-white ${
                                            dateError
                                                ? "border-red-500 focus:ring-red-500"
                                                : "border-gray-300 focus:ring-blue-500"
                                        }`}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="event-date-end" className="text-sm font-semibold text-gray-700">
                                        Data de Término <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="event-date-end"
                                        type="date"
                                        min={dateStart || undefined}
                                        value={dateEnd}
                                        onChange={(e) => handleDateEndChange(e.target.value)}
                                        className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-1 text-gray-800 bg-white ${
                                            dateError
                                                ? "border-red-500 focus:ring-red-500"
                                                : "border-gray-300 focus:ring-blue-500"
                                        }`}
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="event-time-end" className="text-sm font-semibold text-gray-700">
                                        Horário Término <span className="text-xs font-normal text-gray-500">(opcional)</span>
                                    </label>
                                    <input
                                        id="event-time-end"
                                        type="time"
                                        value={timeEnd}
                                        onChange={(e) => {
                                            setTimeEnd(e.target.value)
                                            setDateError(null)
                                        }}
                                        className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-1 text-gray-800 bg-white ${
                                            dateError
                                                ? "border-red-500 focus:ring-red-500"
                                                : "border-gray-300 focus:ring-blue-500"
                                        }`}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {dateError && (
                        <span className="text-xs text-red-600 font-medium">{dateError}</span>
                    )}
                </div>

                {/* Description (Optional) */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="event-description" className="text-sm font-semibold text-gray-700">
                        Descrição <span className="text-xs font-normal text-gray-500">(opcional)</span>
                    </label>
                    <textarea
                        id="event-description"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Escreva uma breve descrição com as informações do evento..."
                        className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 resize-y"
                    />
                </div>

                {/* URL (Optional) */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="event-url" className="text-sm font-semibold text-gray-700">
                        Link do Evento <span className="text-xs font-normal text-gray-500">(opcional)</span>
                    </label>
                    <input
                        id="event-url"
                        type="url"
                        value={url}
                        onChange={(e) => {
                            setUrl(e.target.value)
                            setUrlError(null)
                        }}
                        placeholder="https://exemplo.com.br/evento"
                        className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-1 text-gray-800 ${
                            urlError
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:ring-blue-500"
                        }`}
                    />
                    {urlError ? (
                        <span className="text-xs text-red-600 font-medium">{urlError}</span>
                    ) : (
                        <span className="text-xs text-gray-500">
                            Adicione um link para a página do evento, postagem do blog ou inscrição.
                        </span>
                    )}
                </div>
            </form>

            {/* Live Card Preview (centered) */}
            <div className="flex flex-col items-center gap-4 bg-gray-50 p-5 md:p-6 rounded-lg border border-gray-300">
                <div className="flex flex-col items-center gap-0.5 text-center">
                    <h2 className="text-sm font-semibold text-gray-700">
                        Pré-visualização do Cartão
                    </h2>
                    <span className="text-xs text-gray-500">
                        Veja como o evento será exibido no site público.
                    </span>
                </div>

                <EventCardPreview
                    title={title}
                    description={description}
                    type={type}
                    url={url}
                    dateStart={dateStart}
                    dateEnd={dateEnd}
                    timeStart={timeStart}
                    timeEnd={timeEnd}
                    imageKey={selectedCover?.key}
                    imageName={selectedCover?.name}
                />
            </div>

            <ImageSelectModal
                isOpen={isCoverModalOpen}
                onClose={() => setIsCoverModalOpen(false)}
                onSelect={handleSelectCover}
            />
        </div>
    )
}

export default EventEditor
