import { Link } from "react-router-dom"
import { ArrowRightIcon, EyeIcon, ImageIcon, PencilIcon, StarIcon } from "@phosphor-icons/react"
import { API_URL } from "@/config/env"
import CategoryBadge from "@/components/CategoryBadge"
import type { Post } from "@hartat/types/posts"
import { formatDateTime, getBannerAlignmentClass } from "@/features/post-manager/utils/format"

interface RecentPostsCardProps {
    posts: Post[]
}

function RecentPostsCard({ posts }: RecentPostsCardProps) {
    return (
        <section className="flex flex-col border border-gray-300 rounded-lg bg-white overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gray-100 border-b border-gray-300">
                <h2 className="text-sm font-semibold text-gray-800">Postagens Recentes</h2>
                <Link
                    to="/posts"
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                >
                    Ver todas <ArrowRightIcon className="text-xs" />
                </Link>
            </div>

            {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center text-gray-500">
                    <p className="text-sm">Nenhuma postagem cadastrada ainda.</p>
                    <Link
                        to="/posts/new"
                        className="text-xs font-medium text-blue-600 hover:underline"
                    >
                        Criar primeira postagem
                    </Link>
                </div>
            ) : (
                <ul className="divide-y divide-gray-200">
                    {posts.map((post) => (
                        <li
                            key={post.id}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                            {post.image?.key ? (
                                <img
                                    src={`${API_URL}/images/${post.image.key}?preview`}
                                    alt={post.title}
                                    className={`w-11 h-11 min-w-11 aspect-square rounded object-cover ${getBannerAlignmentClass(post.bannerAlignment)} border border-gray-200 shrink-0`}
                                />
                            ) : (
                                <div className="w-11 h-11 min-w-11 aspect-square rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                                    <ImageIcon className="text-lg" />
                                </div>
                            )}

                            <div className="flex flex-col min-w-0 flex-1 gap-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    {post.isHighlighted && (
                                        <span title="Postagem em destaque" className="shrink-0">
                                            <StarIcon
                                                weight="fill"
                                                className="text-sm text-amber-500"
                                            />
                                        </span>
                                    )}
                                    <Link
                                        to={`/posts/edit/${post.id}`}
                                        className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate transition-colors"
                                    >
                                        {post.title}
                                    </Link>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                    {post.category ? (
                                        <CategoryBadge
                                            name={post.category.name}
                                            color={post.category.color}
                                        />
                                    ) : (
                                        <span className="italic text-gray-400">Sem categoria</span>
                                    )}
                                    <span>Atualizado: {formatDateTime(post.updatedAt)}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                                <Link
                                    to={`/posts/preview/${post.id}`}
                                    title="Pré-visualizar postagem"
                                    className="p-1.5 rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                                >
                                    <EyeIcon className="text-base" />
                                </Link>
                                <Link
                                    to={`/posts/edit/${post.id}`}
                                    title="Editar postagem"
                                    className="p-1.5 rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                                >
                                    <PencilIcon className="text-base" />
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}

export default RecentPostsCard
