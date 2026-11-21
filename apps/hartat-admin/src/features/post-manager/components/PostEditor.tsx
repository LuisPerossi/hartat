import { useEffect, useMemo, useRef, useState } from "react"
import { useBlocker, useNavigate } from "react-router-dom"
import { ArrowClockwiseIcon, ArrowLeftIcon, EyeIcon, FloppyDiskIcon, ImageIcon, TrashIcon } from "@phosphor-icons/react"
import { API_URL } from "@/config/env"
import type { BannerAlignment, Post } from "@hartat/types/posts"
import type { Category } from "@hartat/types/categories"
import type { Image } from "@hartat/types/images"
import { fetchCategories } from "@/features/category-manager/utils/categories/fetch"
import ImageSelectModal from "@/features/image-manager/components/ImageSelectModal"
import LoadingSpinner from "@/components/LoadingSpinner"
import QuillEditor from "./QuillEditor"
import { createPost, updatePost } from "../utils/posts"
import { getBannerAlignmentClass, sanitizeSlugInput, slugify } from "../utils/format"

interface PostEditorProps {
    initialPost?: Post | null
    draftPost?: Post | null
    isEditing?: boolean
}

const ALIGNMENT_OPTIONS: { value: BannerAlignment; label: string }[] = [
    { value: "top", label: "Topo" },
    { value: "center", label: "Centro" },
    { value: "bottom", label: "Base" }
]

function normalizeHtml(html: string): string {
    const trimmed = html.trim()
    return trimmed === "<p><br></p>" ? "" : trimmed
}

function PostEditor({ initialPost, draftPost, isEditing = false }: PostEditorProps) {
    const navigate = useNavigate()
    const sourcePost = draftPost ?? initialPost

    const [isLoading, setIsLoading] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])

    // Form fields
    const [title, setTitle] = useState(sourcePost?.title || "")
    const [slug, setSlug] = useState(sourcePost?.slug || "")
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(Boolean(sourcePost?.slug))
    const [slugError, setSlugError] = useState<string | null>(null)
    const [content, setContent] = useState(sourcePost?.content || "")
    const [categoryId, setCategoryId] = useState<number | null>(sourcePost?.categoryId ?? null)
    const [bannerAlignment, setBannerAlignment] = useState<BannerAlignment>(
        sourcePost?.bannerAlignment ?? "center"
    )

    // Banner image
    const [selectedBanner, setSelectedBanner] = useState<{
        id: number
        key: string
        name: string
    } | null>(() => {
        if (sourcePost?.image) {
            return {
                id: sourcePost.image.id,
                key: sourcePost.image.key,
                name: sourcePost.image.name
            }
        }
        if (sourcePost?.imageId) {
            return { id: sourcePost.imageId, key: "", name: "Imagem selecionada" }
        }
        return null
    })

    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false)
    const bypassBlockerRef = useRef(false)

    // Initial snapshot for dirty tracking
    const initialSnapshot = useMemo(
        () => ({
            title: initialPost?.title || "",
            slug: initialPost?.slug || "",
            content: normalizeHtml(initialPost?.content || ""),
            categoryId: initialPost?.categoryId ?? null,
            imageId: initialPost?.image?.id ?? initialPost?.imageId ?? null,
            bannerAlignment: initialPost?.bannerAlignment ?? "center"
        }),
        [initialPost]
    )

    const isDirty = useMemo(() => {
        return (
            title !== initialSnapshot.title ||
            slug !== initialSnapshot.slug ||
            normalizeHtml(content) !== initialSnapshot.content ||
            categoryId !== initialSnapshot.categoryId ||
            (selectedBanner?.id ?? null) !== initialSnapshot.imageId ||
            bannerAlignment !== initialSnapshot.bannerAlignment
        )
    }, [title, slug, content, categoryId, selectedBanner, bannerAlignment, initialSnapshot])

    // Block browser tab close / reload when there are unsaved changes
    useEffect(() => {
        if (!isDirty) return

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (bypassBlockerRef.current) return
            e.preventDefault()
            e.returnValue = ""
        }

        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [isDirty])

    // Block in-app navigation when there are unsaved changes (allow preview)
    const blocker = useBlocker(({ nextLocation }) => {
        if (bypassBlockerRef.current) return false
        if (nextLocation.pathname.startsWith("/posts/preview")) return false
        return isDirty
    })

    useEffect(() => {
        if (blocker.state === "blocked") {
            const shouldLeave = window.confirm(
                "Você tem alterações não salvas. Deseja sair mesmo assim?"
            )
            if (shouldLeave) {
                blocker.proceed()
            } else {
                blocker.reset()
            }
        }
    }, [blocker])

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

    const handleTitleChange = (newTitle: string) => {
        setTitle(newTitle)
        if (!isSlugManuallyEdited) {
            setSlug(slugify(newTitle))
            setSlugError(null)
        }
    }

    const handleSlugChange = (value: string) => {
        setIsSlugManuallyEdited(true)
        setSlug(sanitizeSlugInput(value))
        setSlugError(null)
    }

    const handleRegenerateSlug = () => {
        setSlug(slugify(title))
        setIsSlugManuallyEdited(false)
        setSlugError(null)
    }

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

        const cleanSlug = slug.replace(/^-+|-+$/g, "") || slugify(title)

        const previewData: Post = {
            id: initialPost?.id || 0,
            title: title.trim(),
            slug: cleanSlug,
            content,
            bannerAlignment,
            categoryId,
            category: categories.find((c) => c.id === categoryId) || null,
            imageId: selectedBanner?.id ?? null,
            image: selectedBanner
                ? {
                      id: selectedBanner.id,
                      key: selectedBanner.key,
                      name: selectedBanner.name,
                      extension: ""
                  }
                : null,
            createdAt: initialPost?.createdAt || new Date().toISOString(),
            updatedAt: initialPost?.updatedAt || new Date().toISOString()
        }

        const returnTo = initialPost?.id ? `/posts/edit/${initialPost.id}` : "/posts/new"

        if (initialPost?.id) {
            navigate(`/posts/preview/${initialPost.id}`, { state: { draft: previewData, returnTo } })
        } else {
            navigate("/posts/preview/draft", { state: { draft: previewData, returnTo } })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSlugError(null)

        const trimmedTitle = title.trim()
        if (!trimmedTitle) {
            return window.alert("O título da postagem é obrigatório.")
        }

        if (trimmedTitle.length > 60) {
            return window.alert("O título não pode ter mais de 60 caracteres.")
        }

        const cleanSlug = slug.replace(/^-+|-+$/g, "") || slugify(trimmedTitle)
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
            setSlugError("O slug deve conter apenas letras minúsculas, números e hífens.")
            return
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
                    slug: cleanSlug,
                    content: trimmedContent,
                    bannerAlignment,
                    categoryId,
                    imageId: selectedBanner?.id ?? null
                })
                bypassBlockerRef.current = true
                window.alert("Postagem atualizada com sucesso!")
            } else {
                await createPost({
                    title: trimmedTitle,
                    slug: cleanSlug,
                    content: trimmedContent,
                    bannerAlignment,
                    categoryId,
                    imageId: selectedBanner?.id ?? null
                })
                bypassBlockerRef.current = true
                window.alert("Postagem criada com sucesso!")
            }

            navigate("/posts")
        } catch (err: unknown) {
            console.error(err)
            const message = err instanceof Error ? err.message : "Erro ao salvar postagem"
            if (message.toLowerCase().includes("slug")) {
                setSlugError(message)
            }
            window.alert(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-5 max-w-5xl w-full min-w-0 mx-auto pb-12">
            {isLoading && <LoadingSpinner />}

            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/posts")}
                        className="p-2 rounded-full hover:bg-gray-200 text-gray-700 cursor-pointer transition-colors"
                        title="Voltar para postagens"
                    >
                        <ArrowLeftIcon className="text-xl" />
                    </button>
                    <h1 className="text-2xl font-bold">
                        {isEditing ? "Editar Postagem" : "Nova Postagem"}
                    </h1>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
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
                        className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer transition-colors"
                    >
                        <FloppyDiskIcon className="text-lg" />
                        {isEditing ? "Salvar Alterações" : "Publicar Postagem"}
                    </button>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-5 bg-white p-5 md:p-6 rounded-lg border border-gray-300 min-w-0"
            >
                {/* Banner Section */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <label className="text-sm font-semibold text-gray-700">
                            Banner de Capa
                        </label>

                        {selectedBanner && (
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-gray-600 font-medium">Alinhamento:</span>
                                <div className="inline-flex rounded-md border border-gray-300 overflow-hidden divide-x divide-gray-300">
                                    {ALIGNMENT_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setBannerAlignment(option.value)}
                                            className={`px-2.5 py-1 font-medium cursor-pointer transition-colors ${
                                                bannerAlignment === option.value
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-white text-gray-700 hover:bg-gray-100"
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {selectedBanner ? (
                        <div className="relative group rounded-lg overflow-hidden border border-gray-300 max-h-80 bg-gray-100 flex items-center justify-center">
                            {selectedBanner.key ? (
                                <img
                                    src={`${API_URL}/images/${selectedBanner.key}`}
                                    alt={selectedBanner.name}
                                    className={`w-full h-64 object-cover ${getBannerAlignmentClass(bannerAlignment)}`}
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
                            onChange={(e) => handleTitleChange(e.target.value)}
                            placeholder="Digite o título da postagem..."
                            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 font-medium"
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
                            className="w-full px-2.5 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-800 cursor-pointer"
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

                {/* Slug Field */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                        <label htmlFor="post-slug" className="text-sm font-semibold text-gray-700">
                            Slug (URL)
                        </label>
                        <button
                            type="button"
                            onClick={handleRegenerateSlug}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
                            title="Gerar slug a partir do título"
                        >
                            <ArrowClockwiseIcon className="text-sm" />
                            Gerar do título
                        </button>
                    </div>

                    <div className={`flex items-center rounded-md border overflow-hidden focus-within:ring-1 ${
                        slugError
                            ? "border-red-500 focus-within:ring-red-500"
                            : "border-gray-300 focus-within:ring-blue-500"
                    }`}>
                        <span className="px-3 py-2 bg-gray-100 text-gray-500 text-sm border-r border-gray-300 select-none shrink-0">
                            /posts/
                        </span>
                        <input
                            id="post-slug"
                            type="text"
                            maxLength={100}
                            value={slug}
                            onChange={(e) => handleSlugChange(e.target.value)}
                            onBlur={() => setSlug((prev) => prev.replace(/^-+|-+$/g, ""))}
                            placeholder="slug-da-postagem"
                            className="w-full px-3 py-2 text-sm text-gray-800 focus:outline-none min-w-0"
                        />
                    </div>

                    {slugError ? (
                        <span className="text-xs text-red-600 font-medium">{slugError}</span>
                    ) : (
                        <span className="text-xs text-gray-500">
                            Identificador único da URL. Use apenas letras minúsculas, números e hífens.
                        </span>
                    )}
                </div>

                {/* Content Section with Quill */}
                <div className="flex flex-col gap-2 min-w-0">
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
