import { Link } from "react-router-dom"
import { EyeIcon, ImageIcon, PencilIcon, TrashIcon } from "@phosphor-icons/react"
import { API_URL } from "@/config/env"
import type { Post } from "@hartat/types/posts"
import { deletePost } from "../utils/posts"

interface PostListProps {
    posts: Post[]
    onDeleted: () => void
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
}

function PostList({ posts, onDeleted, setIsLoading }: PostListProps) {
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

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-"
        try {
            return new Date(dateStr).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            })
        } catch {
            return dateStr
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="overflow-x-auto border border-gray-300 rounded-lg bg-white shadow-xs">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b border-gray-300 text-sm font-semibold text-gray-700">
                            <th className="py-3 px-4 w-16 text-center">Capa</th>
                            <th className="py-3 px-4">Título</th>
                            <th className="py-3 px-4">Categoria</th>
                            <th className="py-3 px-4">Data</th>
                            <th className="py-3 px-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {posts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-gray-500">
                                    Nenhuma postagem encontrada.
                                </td>
                            </tr>
                        ) : (
                            posts.map((post) => (
                                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                                    {/* Capa */}
                                    <td className="py-3 px-4 text-center">
                                        {post.image?.key ? (
                                            <img
                                                src={`${API_URL}/images/${post.image.key}?preview`}
                                                alt={post.title}
                                                className="w-12 h-12 rounded object-cover mx-auto border border-gray-200"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto text-gray-400">
                                                <ImageIcon className="text-xl" />
                                            </div>
                                        )}
                                    </td>

                                    {/* Título */}
                                    <td className="py-3 px-4">
                                        <div className="flex flex-col">
                                            <Link
                                                to={`/posts/edit/${post.id}`}
                                                className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                                            >
                                                {post.title}
                                            </Link>
                                            <span className="text-xs text-gray-400">ID: #{post.id}</span>
                                        </div>
                                    </td>

                                    {/* Categoria */}
                                    <td className="py-3 px-4 text-gray-600">
                                        {post.category ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {post.category.name}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Sem categoria</span>
                                        )}
                                    </td>

                                    {/* Data */}
                                    <td className="py-3 px-4 text-sm text-gray-600">
                                        {formatDate(post.createdAt)}
                                    </td>

                                    {/* Ações */}
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex justify-end items-center gap-1.5">
                                            <Link
                                                to={`/posts/preview/${post.id}`}
                                                title="Pré-visualizar postagem"
                                                className="p-1.5 rounded-sm bg-gray-200 hover:bg-blue-100 hover:text-blue-700 text-gray-700 cursor-pointer transition-colors"
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
                                                className="p-1.5 rounded-sm bg-gray-200 hover:bg-red-100 hover:text-red-700 text-gray-700 cursor-pointer transition-colors"
                                            >
                                                <TrashIcon className="text-lg" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default PostList
