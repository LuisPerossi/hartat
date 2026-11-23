import { useEffect, useState } from "react"
import LoadingSpinner from "@/components/LoadingSpinner"
import type { DashboardData } from "../types/dashboard"
import { fetchDashboardData } from "../utils/fetchDashboard"
import CategoriesSummaryCard from "./CategoriesSummaryCard"
import QuickActions from "./QuickActions"
import RecentImagesCard from "./RecentImagesCard"
import RecentPostsCard from "./RecentPostsCard"
import StatsGrid from "./StatsGrid"
import UpcomingEventsCard from "./UpcomingEventsCard"

const EMPTY_DATA: DashboardData = {
    stats: {
        totalPosts: 0,
        highlightedPosts: 0,
        activeEvents: 0,
        archivedEvents: 0,
        totalCategories: 0,
        totalImages: 0
    },
    recentPosts: [],
    upcomingEvents: [],
    categories: [],
    recentImages: []
}

function Dashboard() {
    const [data, setData] = useState<DashboardData>(EMPTY_DATA)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [reloadKey, setReloadKey] = useState(0)

    const handleRefresh = () => {
        setReloadKey((prev) => prev + 1)
    }

    useEffect(() => {
        let cancelled = false

        const loadDashboard = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const result = await fetchDashboardData()
                if (!cancelled) {
                    setData(result)
                }
            } catch (err: unknown) {
                console.error(err)
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : "Erro ao carregar dados do painel"
                    setError(message)
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false)
                }
            }
        }

        loadDashboard()

        return () => {
            cancelled = true
        }
    }, [reloadKey])

    return (
        <div className="flex flex-col gap-5">
            {isLoading && <LoadingSpinner />}

            <QuickActions />

            {error && (
                <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={handleRefresh}
                        className="px-3 py-1 rounded bg-red-100 hover:bg-red-200 font-medium cursor-pointer transition-colors shrink-0"
                    >
                        Tentar novamente
                    </button>
                </div>
            )}

            <StatsGrid stats={data.stats} />

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <UpcomingEventsCard events={data.upcomingEvents} />
                <RecentPostsCard posts={data.recentPosts} />
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <CategoriesSummaryCard categories={data.categories} />
                <RecentImagesCard images={data.recentImages} />
            </div>
        </div>
    )
}

export default Dashboard
