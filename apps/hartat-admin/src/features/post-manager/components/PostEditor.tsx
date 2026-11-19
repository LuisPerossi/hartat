import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeftIcon, EyeIcon, FloppyDiskIcon, ImageIcon, TrashIcon } from "@phosphor-icons/react"
import { API_URL } from "@/config/env"
import type { Post } from "@hartat/types/posts"
import type { Category } from "@hartat/types/categories"
import type { Image } from "@hartat/types/images"
import { fetchCategories } from "@/features/category-manager/utils/categories/fetch"
import ImageSelectModal from "@/features/image-manager/components/ImageSelectModal"
import LoadingSpinner from "@/components/LoadingSpinner"
import QuillEditor from "./QuillEditor"
import { createPost, updatePost } from "../utils/posts"

interface PostEditorProps {
    initialPost?: Post | null
    isEditing?: boolean
}

function PostEditor({ initialPost, isEditing = false }: PostEditorProps) {
    const navigate = useNavigate()

    const [isLoading, setIsLoading] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])

    // Form fields
    const [title, setTitle] = useState(initialPost?.title || "")
    const [content, setContent] = useState(initialPost?.content || "")
    const [categoryId, setCategoryId] = useState<number | null>(initialPost?.categoryId ?? null)
    
    // Banner image
    const [selectedBanner, setSelectedBanner] = useState<{
        id: number
        key: string
        name: string
    } | null>(() => {
        if (initialPost?.image) {
            return {
                id: initialPost.image.id,
                key: initialPost.image.key,
                name: initialPost.image.name
            }
        }
        if (initialPost?.imageId) {
            return { id: initialPost.imageId, key: "", name: "Imagem selecionada" }
        }
        return null
    })

    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false)

    // Load categories
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const cats = await fetchCategories()
                setCategories(cats)
            } catch (err) {
                console.error("Erro ao carregar categorias:", err)
            }
        }
        loadCategories()
    }, [])

    const handleSelectBanner = (image: Image) => {
        setSelectedBanner({
            id: image.id,
            key: image.key,
            name: image.name
        })
    }

    const handleRemoveBanner = () => {
        setSelectedBanner(null)
    }

    const handlePreview = () => {
        if (!title.trim()) {
            return window.alert("Informe um título antes de pré-visualizar.")
        }

        const previewData = {
            id: initialPost?.id || 0,
            title: title.trim(),
            content,
            categoryId,
            category: categories.find(c => c.id === categoryId) || null,
            imageId: selectedBanner?.id ?? null,
            image: selectedBanner ? {
                id: selectedBanner.id,
                key: selectedBanner.key,
                name: selectedBanner.name,
                extension: ""
            } : null,
            createdAt: initialPost?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        // Navigate to preview passing current draft state
        if (initialPost?.id) {
            navigate(`/posts/preview/${initialPost.id}`, { state: { draft: previewData } })
        } else {
            navigate("/posts/preview/draft", { state: { draft: previewData } })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const trimmedTitle = title.trim()
        if (!trimmedTitle) {
            return window.alert("O título da postagem é obrigatório.")
        }

        if (trimmedTitle.length > 60) {
            return window.alert("O título não pode ter mais de 60 caracteres.")
        }

        const trimmedContent = content.trim()
        if (!trimmedContent || trimmedContent === "<p><br></p>") {
            return window.alert("O conteúdo da postagem não pode ser vazio.")
        }

        setIsLoading(true)

        try {
            if (isEditing && initialPost) {
                await updatePost(initialPost.id, {
                    title: trimmedTitle,
                    content: trimmedContent,
                    categoryId,
                    imageId: selectedBanner?.id ?? null
                })
                window.alert("Postagem atualizada com sucesso!")
            } else {
                await createPost({
                    title: trimmedTitle,
                    content: trimmedContent,
                    categoryId,
                    imageId: selectedBanner?.id ?? null
                })
                window.alert("Postagem criada com sucesso!")
            }

            navigate("/posts")
        } catch (err: unknown) {
            console.error(err)
            const message = err instanceof Error ? err.message : "Erro ao salvar postagem"
            window.alert(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-6 max-w-5xl w-full mx-auto pb-12">
            {isLoading && <LoadingSpinner />}

            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/posts")}
                        className="p-2 rounded-full hover:bg-gray-200 text-gray-700 cursor-pointer transition-colors"
                        title="Voltar para postagens"
                    >
                        <ArrowLeftIcon className="text-xl" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {isEditing ? "Editar Postagem" : "Nova Postagem"}
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handlePreview}
                        className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer font-medium transition-colors"
                    >
                        <EyeIcon className="text-lg" />
                        Pré-visualizar
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer transition-colors shadow-sm"
                    >
                        <FloppyDiskIcon className="text-lg" />
                        {isEditing ? "Salvar Alterações" : "Publicar Postagem"}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
                {/* Banner Section */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                        Banner de Capa
                    </label>

                    {selectedBanner ? (
                        <div className="relative group rounded-lg overflow-hidden border border-gray-200 max-h-80 bg-gray-100 flex items-center justify-center">
                            {selectedBanner.key ? (
                                <img
                                    src={`${API_URL}/images/${selectedBanner.key}`}
                                    alt={selectedBanner.name}
                                    className="w-full h-64 object-cover"
                                />
                            ) : (
                                <div className="p-8 text-gray-500">Imagem #{selectedBanner.id}</div>
                            )}

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsBannerModalOpen(true)}
                                    className="px-4 py-2 bg-white text-gray-800 rounded-lg font-medium shadow-md hover:bg-gray-100 cursor-pointer transition-colors"
                                >
                                    Alterar Imagem
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRemoveBanner}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium shadow-md hover:bg-red-700 cursor-pointer transition-colors flex items-center gap-1"
                                >
                                    <TrashIcon className="text-lg" />
                                    Remover
                                </button>
                            </div>

                            <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2.5 py-1 rounded backdrop-blur-xs">
                                {selectedBanner.name || "Banner selecionado"}
                            </span>
                        </div>
                    ) : (
                        <div
                            onClick={() => setIsBannerModalOpen(true)}
                            className="border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/30 rounded-lg p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
                        >
                            <div className="p-3 bg-gray-100 rounded-full text-gray-600">
                                <ImageIcon className="text-3xl" />
                            </div>
                            <span className="font-medium text-gray-700">
                                Clique para definir uma imagem de capa
                            </span>
                            <span className="text-xs text-gray-500">
                                Escolha entre as imagens cadastradas no sistema
                            </span>
                        </div>
                    )}
                </div>

                {/* Title & Category Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                            <label htmlFor="post-title" className="text-sm font-semibold text-gray-700">
                                Título da Postagem <span className="text-red-500">*</span>
                            </label>
                            <span className={`text-xs ${title.length > 55 ? "text-amber-600 font-semibold" : "text-gray-500"}`}>
                                {title.length}/60
                            </span>
                        </div>
                        <input
                            id="post-title"
                            type="text"
                            maxLength={60}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Digite o título da postagem..."
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 font-medium"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="post-category" className="text-sm font-semibold text-gray-700">
                            Categoria
                        </label>
                        <select
                            id="post-category"
                            value={categoryId ?? ""}
                            onChange={(e) => {
                                const val = e.target.value
                                setCategoryId(val === "" ? null : Number(val))
                            }}
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800 cursor-pointer"
                        >
                            <option value="">Sem categoria</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Content Section with Quill */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                        Conteúdo da Postagem <span className="text-red-500">*</span>
                    </label>
                    <QuillEditor
                        value={content}
                        onChange={setContent}
                        placeholder="Escreva sua postagem aqui... Use a barra de ferramentas para formatar o texto e adicionar imagens do sistema."
                    />
                </div>
            </form>

            <ImageSelectModal
                isOpen={isBannerModalOpen}
                onClose={() => setIsBannerModalOpen(false)}
                onSelect={handleSelectBanner}
                title="Selecionar Banner da Postagem"
            />
        </div>
    )
}

export default PostEditor
