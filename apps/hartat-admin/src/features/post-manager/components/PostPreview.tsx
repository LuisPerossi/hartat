import { Link, useNavigate } from "react-router-dom"
import { ArrowLeftIcon, CalendarBlankIcon, PencilIcon, TagIcon } from "@phosphor-icons/react"
import { API_URL } from "@/config/env"
import type { Post } from "@hartat/types/posts"

interface PostPreviewProps {
    post: Post
    isDraft?: boolean
}

function PostPreview({ post, isDraft = false }: PostPreviewProps) {
    const navigate = useNavigate()

    const formattedDate = post.createdAt
        ? new Date(post.createdAt).toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
              year: "numeric"
          })
        : "Data indisponível"

    const bannerUrl = post.image?.key
        ? `${API_URL}/images/${post.image.key}`
        : null

    return (
        <div className="flex flex-col gap-6 max-w-4xl w-full mx-auto pb-16">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 flex-wrap gap-4">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                    <ArrowLeftIcon className="text-lg" />
                    Voltar
                </button>

                <div className="flex items-center gap-3">
                    {isDraft && (
                        <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                            Modo Pré-visualização (Rascunho)
                        </span>
                    )}

                    {post.id > 0 && (
                        <Link
                            to={`/posts/edit/${post.id}`}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium cursor-pointer transition-colors shadow-xs"
                        >
                            <PencilIcon className="text-base" />
                            Editar Postagem
                        </Link>
                    )}
                </div>
            </div>

            {/* Public Article Layout Preview */}
            <article className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Banner Image */}
                {bannerUrl && (
                    <div className="w-full max-h-96 overflow-hidden bg-gray-100 border-b border-gray-100">
                        <img
                            src={bannerUrl}
                            alt={post.title}
                            className="w-full h-full object-cover max-h-96"
                        />
                    </div>
                )}

                <div className="p-6 md:p-10 flex flex-col gap-6">
                    {/* Meta header */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                        {post.category && (
                            <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 font-semibold px-3 py-1 rounded-full text-xs">
                                <TagIcon className="text-sm" />
                                {post.category.name}
                            </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            <CalendarBlankIcon className="text-base text-gray-400" />
                            <span>{formattedDate}</span>
                        </div>
                    </div>

                    {/* Article Title */}
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                        {post.title}
                    </h1>

                    <hr className="border-gray-200" />

                    {/* Article Content Rendered */}
                    <div
                        className="post-content-preview text-gray-800 text-base md:text-lg leading-relaxed flex flex-col gap-4"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </div>
            </article>

            {/* Content Styling for rendered HTML */}
            <style>{`
                .post-content-preview h1 {
                    font-size: 1.875rem;
                    line-height: 2.25rem;
                    font-weight: 700;
                    color: #111827;
                    margin-top: 1.5rem;
                    margin-bottom: 0.5rem;
                }
                .post-content-preview h2 {
                    font-size: 1.5rem;
                    line-height: 2rem;
                    font-weight: 600;
                    color: #1f2937;
                    margin-top: 1.25rem;
                    margin-bottom: 0.5rem;
                }
                .post-content-preview p {
                    margin-bottom: 0.75rem;
                }
                .post-content-preview a {
                    color: #2563eb;
                    text-decoration: underline;
                    text-underline-offset: 2px;
                }
                .post-content-preview a:hover {
                    color: #1d4ed8;
                }
                .post-content-preview blockquote {
                    border-left: 4px solid #3b82f6;
                    padding-left: 1rem;
                    font-style: italic;
                    color: #4b5563;
                    background: #f9fafb;
                    padding-top: 0.5rem;
                    padding-bottom: 0.5rem;
                    border-radius: 0 0.375rem 0.375rem 0;
                }
                .post-content-preview pre {
                    background-color: #1f2937;
                    color: #f3f4f6;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    overflow-x: auto;
                    font-family: monospace;
                    font-size: 0.875rem;
                }
                .post-content-preview ul {
                    list-style-type: disc;
                    padding-left: 1.5rem;
                    margin-bottom: 0.75rem;
                }
                .post-content-preview ol {
                    list-style-type: decimal;
                    padding-left: 1.5rem;
                    margin-bottom: 0.75rem;
                }
                .post-content-preview img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 0.5rem;
                    margin: 1rem auto;
                    display: block;
                    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
                }
            `}</style>
        </div>
    )
}

export default PostPreview
