import { Link } from "react-router-dom"
import {
    ArticleIcon,
    CalendarIcon,
    ImageIcon,
    ListDashesIcon,
    StarIcon
} from "@phosphor-icons/react"
import { MAX_CATEGORIES } from "@hartat/types/categories"
import type { DashboardStats } from "../types/dashboard"

interface StatsGridProps {
    stats: DashboardStats
}

function StatsGrid({ stats }: StatsGridProps) {
    const cards = [
        {
            to: "/posts",
            label: "Postagens",
            value: String(stats.totalPosts),
            meta: (
                <span className="inline-flex items-center gap-1 text-amber-700">
                    <StarIcon weight="fill" className="text-sm text-amber-500" />
                    {stats.highlightedPosts} em destaque
                </span>
            ),
            icon: <ArticleIcon className="text-2xl text-blue-600" />,
            iconBg: "bg-blue-50"
        },
        {
            to: "/events",
            label: "Eventos",
            value: String(stats.activeEvents),
            meta: `${stats.archivedEvents} arquivado${stats.archivedEvents === 1 ? "" : "s"}`,
            icon: <CalendarIcon className="text-2xl text-emerald-600" />,
            iconBg: "bg-emerald-50"
        },
        {
            to: "/categories",
            label: "Categorias",
            value: `${stats.totalCategories} / ${MAX_CATEGORIES}`,
            meta: `${Math.max(0, MAX_CATEGORIES - stats.totalCategories)} disponíveis`,
            icon: <ListDashesIcon className="text-2xl text-amber-600" />,
            iconBg: "bg-amber-50"
        },
        {
            to: "/images",
            label: "Imagens",
            value: String(stats.totalImages),
            meta: "Biblioteca de mídia",
            icon: <ImageIcon className="text-2xl text-slate-600" />,
            iconBg: "bg-slate-100"
        }
    ]

    return (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
                <Link
                    key={card.to}
                    to={card.to}
                    className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50/60 transition-colors"
                >
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-gray-500">{card.label}</span>
                        <span className="text-2xl font-bold text-gray-900 mt-0.5">{card.value}</span>
                        <span className="text-xs text-gray-500 mt-1 truncate">{card.meta}</span>
                    </div>

                    <div className={`p-3 rounded-lg shrink-0 ${card.iconBg}`}>
                        {card.icon}
                    </div>
                </Link>
            ))}
        </section>
    )
}

export default StatsGrid
