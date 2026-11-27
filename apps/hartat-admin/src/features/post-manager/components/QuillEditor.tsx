import { useEffect, useRef, useState } from "react"
import Quill from "quill"
import QuillResize from "quill-resize-module"
import "quill/dist/quill.snow.css"
import "quill-resize-module/dist/resize.css"
import { PUBLIC_API_URL } from "@/config/env"
import type { Image } from "@hartat/types/images"
import ImageSelectModal from "@/features/image-manager/components/ImageSelectModal"

if (!Quill.imports["modules/resize"]) {
    Quill.register("modules/resize", QuillResize)
}

interface QuillEditorProps {
    value: string
    onChange: (content: string) => void
    placeholder?: string
}

function QuillEditor({ value, onChange, placeholder = "Escreva o conteúdo da postagem..." }: QuillEditorProps) {
    const editorContainerRef = useRef<HTMLDivElement>(null)
    const quillRef = useRef<Quill | null>(null)
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const isInternalChangeRef = useRef(false)
    const onChangeRef = useRef(onChange)
    const initialValueRef = useRef(value)

    useEffect(() => {
        onChangeRef.current = onChange
    }, [onChange])

    useEffect(() => {
        if (!editorContainerRef.current) return

        // Create container for quill
        const container = editorContainerRef.current
        container.innerHTML = ""
        const editorDiv = document.createElement("div")
        container.appendChild(editorDiv)

        const quill = new Quill(editorDiv, {
            theme: "snow",
            placeholder,
            formats: [
                "header",
                "bold",
                "italic",
                "underline",
                "strike",
                "align",
                "list",
                "blockquote",
                "link",
                "image",
                "width",
            ],
            modules: {
                toolbar: {
                    container: [
                        // Only 3 options: h1, h2, paragraph (header: false)
                        [{ header: [1, 2, false] }],
                        ["bold", "italic", "underline", "strike"],
                        [{ align: [] }],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["blockquote"],
                        ["link", "image"],
                        ["clean"]
                    ],
                    handlers: {
                        image: () => {
                            setIsImageModalOpen(true)
                        }
                    }
                },
                resize: {
                    modules: ["Resize", "DisplaySize", "Keyboard"],
                    parchment: {
                        image: {
                            attribute: ["width"],
                            limit: {
                                minWidth: 80
                            }
                        }
                    },
                    onActive(blot: unknown) {
                        try {
                            const index = quill.getIndex(blot as Parameters<Quill["getIndex"]>[0])
                            quill.setSelection(index, 1, "silent")
                        } catch {
                            // ignore if blot is detached
                        }
                    }
                }
            }
        })

        quillRef.current = quill

        if (initialValueRef.current) {
            quill.root.innerHTML = initialValueRef.current
        }

        // Apply translated tooltips to toolbar buttons
        const toolbarElement = container.querySelector(".ql-toolbar")
        if (toolbarElement) {
            const tooltips: Record<string, string> = {
                ".ql-bold": "Negrito",
                ".ql-italic": "Itálico",
                ".ql-underline": "Sublinhado",
                ".ql-strike": "Tachado",
                ".ql-align": "Alinhamento",
                ".ql-blockquote": "Citação",
                '.ql-list[value="ordered"]': "Lista numerada",
                '.ql-list[value="bullet"]': "Lista com marcadores",
                ".ql-link": "Inserir link",
                ".ql-image": "Inserir imagem do sistema",
                ".ql-clean": "Limpar formatação",
                ".ql-header": "Tamanho do texto (Título 1, Título 2, Parágrafo)"
            }

            Object.entries(tooltips).forEach(([selector, title]) => {
                const el = toolbarElement.querySelector(selector)
                if (el) {
                    el.setAttribute("title", title)
                }
            })
        }

        quill.on("text-change", () => {
            isInternalChangeRef.current = true
            const html = quill.root.innerHTML === "<p><br></p>" ? "" : quill.root.innerHTML
            onChangeRef.current(html)
            isInternalChangeRef.current = false
        })

        return () => {
            quillRef.current = null
            container.innerHTML = ""
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Sync external value updates (e.g. when post data loads)
    useEffect(() => {
        if (!quillRef.current || isInternalChangeRef.current) return
        const currentHtml = quillRef.current.root.innerHTML === "<p><br></p>" ? "" : quillRef.current.root.innerHTML
        if (value !== currentHtml) {
            quillRef.current.root.innerHTML = value || ""
        }
    }, [value])

    const handleSelectImages = (images: Image[]) => {
        const quill = quillRef.current
        if (!quill || images.length === 0) return

        const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 }
        let insertIndex = range.index

        images.forEach((image) => {
            const imageUrl = `${PUBLIC_API_URL}/images/${image.key}`
            quill.insertEmbed(insertIndex, "image", imageUrl, "user")
            insertIndex += 1
            quill.insertText(insertIndex, "\n", "user")
            insertIndex += 1
        })

        quill.setSelection(insertIndex, 0, "user")
    }

    return (
        <div className="quill-editor-wrapper flex flex-col w-full max-w-full min-w-0">
            <style>{`
                /* Translated header dropdown in Quill Snow theme */
                .quill-editor-wrapper .ql-snow .ql-picker.ql-header .ql-picker-label::before,
                .quill-editor-wrapper .ql-snow .ql-picker.ql-header .ql-picker-item::before {
                    content: 'Parágrafo' !important;
                }
                .quill-editor-wrapper .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
                .quill-editor-wrapper .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="1"]::before {
                    content: 'Título 1' !important;
                }
                .quill-editor-wrapper .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
                .quill-editor-wrapper .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
                    content: 'Título 2' !important;
                }
                
                /* Translated link tooltip */
                .quill-editor-wrapper .ql-snow .ql-tooltip[data-mode="link"]::before {
                    content: "Inserir link:" !important;
                }
                .quill-editor-wrapper .ql-snow .ql-tooltip.ql-editing a.ql-action::after {
                    content: "Salvar" !important;
                }
                .quill-editor-wrapper .ql-snow .ql-tooltip:not(.ql-editing) a.ql-action::after {
                    content: "Editar" !important;
                }
                .quill-editor-wrapper .ql-snow .ql-tooltip:not(.ql-editing) a.ql-remove::after {
                    content: "Remover" !important;
                }
                
                .quill-editor-wrapper .ql-toolbar {
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    border-color: #d1d5db;
                    background-color: #f9fafb;
                    max-width: 100%;
                    box-sizing: border-box;
                }
                .quill-editor-wrapper .ql-container {
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                    border-color: #d1d5db;
                    height: auto !important;
                    min-height: 280px;
                    font-size: 1rem;
                    width: 100%;
                    max-width: 100%;
                    overflow: hidden;
                    position: relative;
                    box-sizing: border-box;
                }
                .quill-editor-wrapper .ql-editor {
                    min-height: 280px;
                    max-height: 60vh;
                    overflow-y: auto;
                    overflow-x: hidden;
                    word-break: break-word;
                    overflow-wrap: anywhere;
                    box-sizing: border-box;
                }
                .quill-editor-wrapper .ql-editor img {
                    max-width: 100%;
                    height: auto;
                    display: inline-block;
                    border-radius: 0.375rem;
                    margin: 0.5rem 0;
                    cursor: pointer;
                }
            `}</style>

            <div ref={editorContainerRef} className="flex flex-col w-full max-w-full min-w-0" />

            <ImageSelectModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                onSelectMultiple={handleSelectImages}
                multiple
            />
        </div>
    )
}

export default QuillEditor
