import { useEffect, useMemo, useRef, useState } from "react"
import { useBlocker, useNavigate } from "react-router-dom"
import { ArrowClockwiseIcon, ArrowLeftIcon, EyeIcon, FloppyDiskIcon, ImageIcon, QuestionIcon, StarIcon, TrashIcon } from "@phosphor-icons/react"
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
    const [isSlugHelpOpen, setIsSlugHelpOpen] = useState(false)
    const [content, setContent] = useState(sourcePost?.content || "")
    const [categoryId, setCategoryId] = useState<number | null>(sourcePost?.categoryId ?? null)
    const [isHighlighted, setIsHighlighted] = useState<boolean>(Boolean(sourcePost?.isHighlighted))
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
            bannerAlignment: initialPost?.bannerAlignment ?? "center",
            isHighlighted: Boolean(initialPost?.isHighlighted)
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
            bannerAlignment !== initialSnapshot.bannerAlignment ||
            isHighlighted !== initialSnapshot.isHighlighted
        )
    }, [title, slug, content, categoryId, selectedBanner, bannerAlignment, isHighlighted, initialSnapshot])

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
            isHighlighted,
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
                    isHighlighted,
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
                    isHighlighted,
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

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/posts")}
                        className="p-2 rounded-full hover:bg-gray-200 text-gray-700 cursor-pointer transition-colors shrink-0"
                        title="Voltar para postagens"
                    >
                        <ArrowLeftIcon className="text-xl" />
                    </button>
                    <h1 className="text-xl sm:text-2xl font-bold truncate">
                        {isEditing ? "Editar Postagem" : "Nova Postagem"}
                    </h1>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={handlePreview}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer font-medium transition-colors text-sm sm:text-base whitespace-nowrap"
                    >
                        <EyeIcon className="text-lg shrink-0" />
                        <span>Pré-visualizar</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer transition-colors text-sm sm:text-base whitespace-nowrap"
                    >
                        <FloppyDiskIcon className="text-lg shrink-0" />
                        <span>{isEditing ? "Salvar Alterações" : "Publicar Postagem"}</span>
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
                            className="border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/30 rounded-lg p-6 sm:p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center"
                        >
                            <div className="p-3 bg-gray-100 rounded-full text-gray-600">
                                <ImageIcon className="text-3xl" />
                            </div>
                            <span className="font-medium text-gray-700 text-center">
                                Clique para definir uma imagem de capa
                            </span>
                            <span className="text-xs text-gray-500 text-center">
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
                        <div className="flex items-center gap-1.5">
                            <label htmlFor="post-slug" className="text-sm font-semibold text-gray-700">
                                Slug (URL)
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsSlugHelpOpen((prev) => !prev)}
                                onBlur={() => setIsSlugHelpOpen(false)}
                                className="relative group flex items-center cursor-help focus:outline-none"
                                title="Identificador único da URL. Use apenas letras minúsculas, números e hífens."
                                aria-label="Ajuda sobre o Slug"
                            >
                                <QuestionIcon className="text-base text-gray-400 group-hover:text-gray-600 transition-colors" />
                                <div
                                    className={`absolute left-0 bottom-full mb-1.5 flex-col z-20 pointer-events-none ${
                                        isSlugHelpOpen ? "flex" : "hidden group-hover:flex"
                                    }`}
                                >
                                    <div className="bg-gray-800 text-white text-xs font-normal rounded-md py-1.5 px-2.5 shadow-lg w-60 sm:w-auto max-w-[75vw] whitespace-normal sm:whitespace-nowrap text-left leading-relaxed">
                                        Identificador único da URL. Use apenas letras minúsculas, números e hífens.
                                    </div>
                                    <div className="w-2 h-1 ml-1.5 -mt-px border-t-4 border-t-gray-800 border-x-4 border-x-transparent border-b-0"></div>
                                </div>
                            </button>
                        </div>

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

                    {slugError && (
                        <span className="text-xs text-red-600 font-medium">{slugError}</span>
                    )}
                </div>

                {/* Highlight Option */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50/60">
                    <div className="flex items-center gap-2.5">
                        <StarIcon
                            weight={isHighlighted ? "fill" : "regular"}
                            className={`text-lg transition-colors ${isHighlighted ? "text-amber-500" : "text-gray-400"}`}
                        />
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-medium text-gray-700">
                                Destacar Postagem
                            </span>
                            <span className="text-xs text-gray-400">
                                (máx. 10)
                            </span>
                        </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                            type="checkbox"
                            checked={isHighlighted}
                            onChange={(e) => setIsHighlighted(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
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
            />
        </div>
    )
}

export default PostEditor
