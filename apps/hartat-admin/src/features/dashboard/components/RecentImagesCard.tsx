import { Link } from "react-router-dom"
import { ArrowRightIcon } from "@phosphor-icons/react"
import { API_URL } from "@/config/env"
import type { Image } from "@hartat/types/images"

interface RecentImagesCardProps {
    images: Image[]
}

function RecentImagesCard({ images }: RecentImagesCardProps) {
    return (
        <section className="flex flex-col border border-gray-300 rounded-lg bg-white overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gray-100 border-b border-gray-300">
                <h2 className="text-sm font-semibold text-gray-800">Imagens Recentes</h2>
                <Link
                    to="/images"
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                >
                    Ver biblioteca <ArrowRightIcon className="text-xs" />
                </Link>
            </div>

            {images.length === 0 ? (
                <div className="py-8 px-4 text-center text-sm text-gray-500">
                    Nenhuma imagem enviada ainda.
                </div>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 p-4">
                    {images.map((image) => {
                        const imageUrl = `${API_URL}/admin/images/${image.key}`
                        return (
                            <a
                                key={image.id}
                                href={imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={image.name}
                                className="group flex flex-col gap-1 min-w-0"
                            >
                                <div className="rounded-md overflow-hidden border border-gray-200 bg-gray-100 group-hover:border-blue-400 transition-colors">
                                    <img
                                        src={`${imageUrl}?preview`}
                                        alt={image.name}
                                        className="w-full aspect-square object-cover block"
                                    />
                                </div>
                                <span className="text-xs text-gray-600 truncate">
                                    {image.name}
                                </span>
                            </a>
                        )
                    })}
                </div>
            )}
        </section>
    )
}

export default RecentImagesCard
