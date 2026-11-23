import { Link } from "react-router-dom"
import { EyeIcon, ImageIcon, PencilIcon, StarIcon, TrashIcon } from "@phosphor-icons/react"
import { API_URL } from "@/config/env"
import type { Post } from "@hartat/types/posts"
import { deletePost, updatePost } from "../utils/posts"
import { formatDateTime, getBannerAlignmentClass, isPostModified } from "../utils/format"
import CategoryBadge from "@/components/CategoryBadge"

interface PostListProps {
    posts: Post[]
    onDeleted: () => void
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
}

function PostList({ posts, onDeleted, setIsLoading }: PostListProps) {
    const handleToggleHighlight = async (post: Post) => {
        setIsLoading(true)
        try {
            await updatePost(post.id, { isHighlighted: !post.isHighlighted })
            onDeleted()
        } catch (err: unknown) {
            console.error(err)
            const message = err instanceof Error ? err.message : "Erro ao alterar destaque"
            window.alert(message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (post: Post) => {
        const confirm = window.confirm(`Tem certeza que deseja excluir a postagem "${post.title}"?`)
        if (!confirm) return

        setIsLoading(true)

        try {
            await deletePost(post.id)
            onDeleted()
        } catch (err: unknown) {
            console.error(err)
            const message = err instanceof Error ? err.message : "Erro ao excluir postagem"
            window.alert(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-2 flex-1">
            {/* Desktop Table (matches CategoryList design) */}
            <div className="hidden md:block overflow-x-auto border border-gray-300 rounded-lg">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="divide-x divide-gray-200 bg-gray-100 border-b border-gray-300 text-sm font-semibold text-gray-700">
                            <th className="py-3 px-4 w-16 text-center">Capa</th>
                            <th className="py-3 px-4 w-full">Título</th>
                            <th className="py-3 px-4 text-center whitespace-nowrap">Categoria</th>
                            <th className="py-3 px-4 text-center whitespace-nowrap">Data</th>
                            <th className="py-3 px-4 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {posts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-gray-500">
                                    Nenhuma postagem encontrada
                                </td>
                            </tr>
                        ) : (
                            posts.map((post) => {
                                const modified = isPostModified(post.createdAt, post.updatedAt)

                                return (
                                    <tr key={post.id} className="divide-x divide-gray-200 hover:bg-gray-50 transition-colors">
                                        {/* Capa */}
                                        <td className="py-3 px-4 text-center">
                                            {post.image?.key ? (
                                                <img
                                                    src={`${API_URL}/images/${post.image.key}?preview`}
                                                    alt={post.title}
                                                    className={`w-12 h-12 rounded object-cover ${getBannerAlignmentClass(post.bannerAlignment)} mx-auto border border-gray-200`}
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto text-gray-400">
                                                    <ImageIcon className="text-xl" />
                                                </div>
                                            )}
                                        </td>

                                        {/* Título & Slug */}
                                        <td className="py-3 px-4">
                                            <div className="flex flex-col min-w-0">
                                                <Link
                                                    to={`/posts/edit/${post.id}`}
                                                    className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                                                >
                                                    {post.title}
                                                </Link>
                                                {post.slug && (
                                                    <span className="text-xs text-gray-400 truncate">
                                                        /{post.slug}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Categoria */}
                                        <td className="py-3 px-4 text-gray-600 text-center whitespace-nowrap">
                                            {post.category ? (
                                                <CategoryBadge
                                                    name={post.category.name}
                                                    color={post.category.color}
                                                />
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Sem categoria</span>
                                            )}
                                        </td>

                                        {/* Data */}
                                        <td className="py-3 px-4 text-sm text-gray-600 text-center whitespace-nowrap">
                                            <div className="flex flex-col items-center">
                                                <span>{formatDateTime(post.createdAt)}</span>
                                                {modified && (
                                                    <span className="text-xs text-gray-400">
                                                        Mod: {formatDateTime(post.updatedAt)}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Ações */}
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleHighlight(post)}
                                                    title={post.isHighlighted ? "Remover dos destaques" : "Destacar na Home"}
                                                    className={`p-1.5 rounded-sm cursor-pointer transition-colors ${
                                                        post.isHighlighted
                                                            ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                                            : "bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-amber-600"
                                                    }`}
                                                >
                                                    <StarIcon weight={post.isHighlighted ? "fill" : "regular"} className="text-lg" />
                                                </button>

                                                <Link
                                                    to={`/posts/preview/${post.id}`}
                                                    title="Pré-visualizar postagem"
                                                    className="p-1.5 rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer transition-colors"
                                                >
                                                    <EyeIcon className="text-lg" />
                                                </Link>

                                                <Link
                                                    to={`/posts/edit/${post.id}`}
                                                    title="Editar postagem"
                                                    className="p-1.5 rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer transition-colors"
                                                >
                                                    <PencilIcon className="text-lg" />
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(post)}
                                                    title="Excluir postagem"
                                                    className="p-1.5 rounded-sm bg-gray-200 hover:bg-red-100 hover:text-red-600 text-gray-700 cursor-pointer transition-colors"
                                                >
                                                    <TrashIcon className="text-lg" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden border border-gray-300 rounded-lg divide-y divide-gray-200 overflow-hidden">
                {posts.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                        Nenhuma postagem encontrada
                    </div>
                ) : (
                    posts.map((post) => {
                        const modified = isPostModified(post.createdAt, post.updatedAt)

                        return (
                            <div key={post.id} className="p-3 flex flex-col gap-2.5 bg-white">
                                <div className="flex items-start gap-3">
                                    {post.image?.key ? (
                                        <img
                                            src={`${API_URL}/images/${post.image.key}?preview`}
                                            alt={post.title}
                                            className={`w-14 h-14 rounded object-cover ${getBannerAlignmentClass(post.bannerAlignment)} shrink-0 border border-gray-200`}
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 text-gray-400">
                                            <ImageIcon className="text-xl" />
                                        </div>
                                    )}

                                    <div className="flex flex-col min-w-0 flex-1 justify-center gap-1">
                                        <Link
                                            to={`/posts/edit/${post.id}`}
                                            className="font-medium text-gray-900 hover:text-blue-600 transition-colors leading-snug wrap-break-word"
                                        >
                                            {post.title}
                                        </Link>
                                        <div>
                                            {post.category ? (
                                                <CategoryBadge
                                                    name={post.category.name}
                                                    color={post.category.color}
                                                />
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Sem categoria</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                                    <div className="flex flex-col text-xs text-gray-600">
                                        <span>{formatDateTime(post.createdAt)}</span>
                                        {modified && (
                                            <span className="text-gray-400">
                                                Mod: {formatDateTime(post.updatedAt)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleHighlight(post)}
                                            title={post.isHighlighted ? "Remover dos destaques" : "Destacar na Home"}
                                            className={`p-1.5 rounded-sm cursor-pointer transition-colors ${
                                                post.isHighlighted
                                                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                                    : "bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-amber-600"
                                            }`}
                                        >
                                            <StarIcon weight={post.isHighlighted ? "fill" : "regular"} className="text-lg" />
                                        </button>

                                        <Link
                                            to={`/posts/preview/${post.id}`}
                                            title="Pré-visualizar postagem"
                                            className="p-1.5 rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer transition-colors"
                                        >
                                            <EyeIcon className="text-lg" />
                                        </Link>

                                        <Link
                                            to={`/posts/edit/${post.id}`}
                                            title="Editar postagem"
                                            className="p-1.5 rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer transition-colors"
                                        >
                                            <PencilIcon className="text-lg" />
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(post)}
                                            title="Excluir postagem"
                                            className="p-1.5 rounded-sm bg-gray-200 hover:bg-red-100 hover:text-red-600 text-gray-700 cursor-pointer transition-colors"
                                        >
                                            <TrashIcon className="text-lg" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default PostList
