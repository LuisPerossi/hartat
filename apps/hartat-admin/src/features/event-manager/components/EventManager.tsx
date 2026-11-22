import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArchiveIcon, CalendarBlankIcon, PlusIcon } from "@phosphor-icons/react"
import Searchbar from "@/components/Searchbar"
import Pagination from "@/components/Pagination"
import LoadingSpinner from "@/components/LoadingSpinner"
import type { Event, EventType } from "@hartat/types/events"
import EventList from "./EventList"
import EventOrderSelect from "./EventOrderSelect"
import EventTypeFilter from "./EventTypeFilter"
import type { EventSectionTab, EventSortOrder } from "../types/events"
import { fetchEvents } from "../utils/events"

function EventManager() {
    const [isLoading, setIsLoading] = useState(false)
    const [events, setEvents] = useState<Event[]>([])
    const [activeCount, setActiveCount] = useState<number | null>(null)
    const [archivedCount, setArchivedCount] = useState<number | null>(null)

    // Section tab (upcoming/ongoing vs archived)
    const [activeTab, setActiveTab] = useState<EventSectionTab>("active")

    // Filters and pagination
    const [search, setSearch] = useState("")
    const [selectedType, setSelectedType] = useState<EventType | undefined>(undefined)
    const [sortOrder, setSortOrder] = useState<EventSortOrder>({ sort: "dateStart", order: "asc" })
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Forced reload trigger
    const [forceReload, setForceReload] = useState(0)

    const handleTabChange = (tab: EventSectionTab) => {
        if (tab === activeTab) return
        setActiveTab(tab)
        setSortOrder(
            tab === "active"
                ? { sort: "dateStart", order: "asc" }
                : { sort: "dateEnd", order: "desc" }
        )
        setPage(1)
    }

    const handleSearch = (newSearch: React.SetStateAction<string>) => {
        setSearch(newSearch)
        setPage(1)
    }

    const handleTypeChange = (type?: EventType) => {
        setSelectedType(type)
        setPage(1)
    }

    const handleSortOrderChange: React.Dispatch<React.SetStateAction<EventSortOrder>> = (action) => {
        setSortOrder(action)
        setPage(1)
    }

    // Fetch events for current tab + count for the other tab
    useEffect(() => {
        const loadEvents = async () => {
            setIsLoading(true)
            try {
                const otherTab: EventSectionTab = activeTab === "active" ? "past" : "active"

                const [currentRes, otherRes] = await Promise.all([
                    fetchEvents({
                        search,
                        type: selectedType,
                        status: activeTab,
                        sort: sortOrder.sort,
                        order: sortOrder.order,
                        page,
                        limit: 10
                    }),
                    fetchEvents({
                        search,
                        type: selectedType,
                        status: otherTab,
                        page: 1,
                        limit: 1
                    })
                ])

                setEvents(currentRes.events)
                setTotalPages(currentRes.pagination.totalPages || 1)

                if (activeTab === "active") {
                    setActiveCount(currentRes.pagination.totalRecords)
                    setArchivedCount(otherRes.pagination.totalRecords)
                } else {
                    setArchivedCount(currentRes.pagination.totalRecords)
                    setActiveCount(otherRes.pagination.totalRecords)
                }
            } catch (err: unknown) {
                console.error(err)
                const message = err instanceof Error ? err.message : "Erro ao carregar eventos"
                window.alert(message)
            } finally {
                setIsLoading(false)
            }
        }

        loadEvents()
    }, [activeTab, search, selectedType, sortOrder, page, forceReload])

    return (
        <>
            {isLoading && <LoadingSpinner />}

            <h1 className="text-2xl font-bold">Meus Eventos</h1>

            <div className="flex gap-3 flex-wrap items-center">
                <Searchbar onSearch={handleSearch} />

                <EventTypeFilter selectedType={selectedType} onChange={handleTypeChange} />

                <EventOrderSelect value={sortOrder} onChange={handleSortOrderChange} />

                <Link
                    to="/events/new"
                    className="flex w-fit gap-2 px-4 py-2 items-center rounded-full text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shrink-0"
                >
                    Novo Evento <PlusIcon className="text-xl" />
                </Link>
            </div>

            {/* Section Tabs: Upcoming/Active vs Archived */}
            <div className="flex border-b border-gray-300 gap-1">
                <button
                    type="button"
                    onClick={() => handleTabChange("active")}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                        activeTab === "active"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                    }`}
                >
                    <CalendarBlankIcon className="text-lg" />
                    Próximos Eventos
                    {activeCount !== null && (
                        <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                                activeTab === "active"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-200 text-gray-700"
                            }`}
                        >
                            {activeCount}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => handleTabChange("past")}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                        activeTab === "past"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                    }`}
                >
                    <ArchiveIcon className="text-lg" />
                    Arquivados
                    {archivedCount !== null && (
                        <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                                activeTab === "past"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-200 text-gray-700"
                            }`}
                        >
                            {archivedCount}
                        </span>
                    )}
                </button>
            </div>

            <EventList
                events={events}
                emptyMessage={
                    activeTab === "active"
                        ? "Nenhum evento próximo ou em andamento encontrado"
                        : "Nenhum evento arquivado encontrado"
                }
                onDeleted={() => setForceReload((prev) => prev + 1)}
                setIsLoading={setIsLoading}
            />

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
    )
}

export default EventManager
