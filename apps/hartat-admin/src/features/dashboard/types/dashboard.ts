import type { Category } from "@hartat/types/categories"
import type { Event } from "@hartat/types/events"
import type { Image } from "@hartat/types/images"
import type { Post } from "@hartat/types/posts"

export interface DashboardStats {
    totalPosts: number
    highlightedPosts: number
    activeEvents: number
    archivedEvents: number
    totalCategories: number
    totalImages: number
}

export interface DashboardData {
    stats: DashboardStats
    recentPosts: Post[]
    upcomingEvents: Event[]
    categories: Category[]
    recentImages: Image[]
}
