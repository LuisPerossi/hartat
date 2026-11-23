import { fetchCategories } from "@/features/category-manager/utils/categories/fetch"
import { fetchEvents } from "@/features/event-manager/utils/events"
import { fetchImages } from "@/features/image-manager/utils/images/fetch"
import { fetchPosts } from "@/features/post-manager/utils/posts"
import type { DashboardData } from "../types/dashboard"

export async function fetchDashboardData(): Promise<DashboardData> {
    const [
        recentPostsRes,
        highlightedPostsRes,
        activeEventsRes,
        archivedEventsRes,
        categories,
        recentImagesRes
    ] = await Promise.all([
        fetchPosts({ sort: "updated", order: "desc", page: 1, limit: 5 }),
        fetchPosts({ isHighlighted: true, page: 1, limit: 1 }),
        fetchEvents({ status: "active", sort: "dateStart", order: "asc", page: 1, limit: 5 }),
        fetchEvents({ status: "past", page: 1, limit: 1 }),
        fetchCategories(),
        fetchImages({ sort: "date", order: "desc", page: 1, limit: 6 })
    ])

    return {
        stats: {
            totalPosts: recentPostsRes.pagination.totalRecords,
            highlightedPosts: highlightedPostsRes.pagination.totalRecords,
            activeEvents: activeEventsRes.pagination.totalRecords,
            archivedEvents: archivedEventsRes.pagination.totalRecords,
            totalCategories: categories.length,
            totalImages: recentImagesRes.pagination.totalRecords
        },
        recentPosts: recentPostsRes.posts,
        upcomingEvents: activeEventsRes.events,
        categories,
        recentImages: recentImagesRes.images
    }
}
