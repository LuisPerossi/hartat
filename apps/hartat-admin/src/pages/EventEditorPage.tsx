import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import type { Event } from "@hartat/types/events"
import LoadingSpinner from "@/components/LoadingSpinner"
import EventEditor from "../features/event-manager/components/EventEditor"
import { fetchEventById } from "../features/event-manager/utils/events"

function EventEditorPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [event, setEvent] = useState<Event | null>(null)

    const isEditing = Boolean(id)

    useEffect(() => {
        if (!id) return

        const eventId = Number(id)
        if (isNaN(eventId)) {
            window.alert("ID de evento inválido")
            navigate("/events")
            return
        }

        const loadEvent = async () => {
            setIsLoading(true)
            try {
                const data = await fetchEventById(eventId)
                setEvent(data)
            } catch (err: unknown) {
                console.error(err)
                const message = err instanceof Error ? err.message : "Erro ao carregar evento"
                window.alert(message)
                navigate("/events")
            } finally {
                setIsLoading(false)
            }
        }

        loadEvent()
    }, [id, navigate])

    if (isLoading) {
        return <LoadingSpinner />
    }

    if (isEditing && !event) {
        return null
    }

    return (
        <EventEditor
            key={event?.id ?? "new"}
            initialEvent={event}
            isEditing={isEditing}
        />
    )
}

export default EventEditorPage
