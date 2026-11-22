import { useCallback, useEffect, useState } from "react"
import { CheckIcon, PaletteIcon, TagIcon, XIcon } from "@phosphor-icons/react"
import type { Category } from "@hartat/types/categories"
import CategoryBadge from "@/components/CategoryBadge"

const PRESET_COLORS = [
    // Cores Principais (Espectro Cromático: Vermelho -> Laranja -> Amarelo -> Verde -> Azul -> Violeta)
    { name: "Vermelho", hex: "#DC2626" },
    { name: "Laranja", hex: "#EA580C" },
    { name: "Amarelo Dourado", hex: "#EAB308" },
    { name: "Verde Folha", hex: "#45A945" },
    { name: "Azul Real", hex: "#2563EB" },
    { name: "Violeta", hex: "#7C3AED" },

    // Tons Neutros & Terrosos (Terracota -> Ferrugem -> Marrom -> Café -> Ardósia -> Creme)
    { name: "Terracota", hex: "#C58852" },
    { name: "Ferrugem", hex: "#8C4A32" },
    { name: "Marrom Terra", hex: "#644B31" },
    { name: "Café Espresso", hex: "#3D2520" },
    { name: "Ardósia", hex: "#4A4036" },
    { name: "Creme Quente", hex: "#FFF6ED" }
]

interface CategoryModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: { name: string; color: string }) => Promise<void>
    initialCategory?: Category | null
    isSaving?: boolean
}

function CategoryModal({
    isOpen,
    onClose,
    onSave,
    initialCategory,
    isSaving = false
}: CategoryModalProps) {
    const isEditing = Boolean(initialCategory)

    const [name, setName] = useState(initialCategory?.name || "")
    const [color, setColor] = useState(initialCategory?.color || "#C58852")
    const [nameError, setNameError] = useState<string | null>(null)

    const initialName = initialCategory?.name || ""
    const initialColor = initialCategory?.color || "#C58852"

    const isDirty =
        name !== initialName ||
        color.trim().toLowerCase() !== initialColor.trim().toLowerCase()

    const handleCloseAttempt = useCallback(() => {
        if (isSaving) return
        if (isDirty) {
            const shouldLeave = window.confirm(
                "Você tem alterações não salvas. Deseja sair mesmo assim?"
            )
            if (!shouldLeave) return
        }
        onClose()
    }, [isSaving, isDirty, onClose])

    // Warn on page close / reload when there are unsaved changes
    useEffect(() => {
        if (!isOpen || !isDirty) return

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault()
            e.returnValue = ""
        }

        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [isOpen, isDirty])

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleCloseAttempt()
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isOpen, handleCloseAttempt])

    if (!isOpen) return null

    const handleHexInput = (raw: string) => {
        let val = raw.trim()
        if (!val.startsWith("#") && val.length > 0) {
            val = `#${val}`
        }
        setColor(val.slice(0, 7))
    }

    const validColor = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)
        ? color
        : "#C58852"

    const isCustomColor = !PRESET_COLORS.some(
        (p) => p.hex.toLowerCase() === color.trim().toLowerCase()
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const trimmed = name.trim()
        if (trimmed.length === 0) {
            setNameError("O nome da categoria não pode ser vazio")
            return
        }
        if (trimmed.length > 20) {
            setNameError("O nome da categoria deve ter no máximo 20 caracteres")
            return
        }

        try {
            await onSave({ name: trimmed, color: validColor })
            onClose()
        } catch {
            // Error handling is handled in caller or service
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2 text-gray-800 font-bold text-lg">
                        <TagIcon className="text-xl text-blue-600" />
                        <h2>{isEditing ? "Editar Categoria" : "Nova Categoria"}</h2>
                    </div>
                    <button
                        type="button"
                        onClick={handleCloseAttempt}
                        disabled={isSaving}
                        className="p-1.5 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors disabled:opacity-50"
                        title="Fechar"
                    >
                        <XIcon className="text-xl" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                    {/* Name input */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-sm font-semibold text-gray-700">
                            <label htmlFor="category-name">Nome</label>
                            <span className="text-xs text-gray-400 font-normal">
                                {name.length}/20
                            </span>
                        </div>
                        <input
                            id="category-name"
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value)
                                if (nameError) setNameError(null)
                            }}
                            maxLength={20}
                            placeholder="Ex: Cinema, Exposições, Acervo..."
                            autoFocus
                            disabled={isSaving}
                            className={`px-3.5 py-2 rounded-lg border ${
                                nameError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            } focus:outline-none focus:ring-2 transition-shadow text-gray-900`}
                        />
                        {nameError && (
                            <span className="text-xs text-red-600 font-medium">{nameError}</span>
                        )}
                    </div>

                    {/* Color selection */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
                            <div className="flex items-center gap-1.5">
                                <PaletteIcon className="text-base text-gray-500" />
                                <span>Selecionar cor</span>
                            </div>
                            <span className="font-mono text-xs text-gray-500 uppercase">{color}</span>
                        </div>

                        {/* Presets Grid */}
                        <div className="grid grid-cols-6 gap-2">
                            {PRESET_COLORS.map((preset) => {
                                const isSelected = color.toLowerCase() === preset.hex.toLowerCase()
                                return (
                                    <button
                                        key={preset.hex}
                                        type="button"
                                        onClick={() => setColor(preset.hex)}
                                        title={`${preset.name} (${preset.hex})`}
                                        className={`w-full aspect-square rounded-lg flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-xs border ${
                                            isSelected ? "ring-2 ring-offset-2 ring-gray-900 border-transparent" : "border-black/10"
                                        }`}
                                        style={{ backgroundColor: preset.hex }}
                                    >
                                        {isSelected && (
                                            <CheckIcon
                                                className={`text-sm drop-shadow ${
                                                    preset.hex.toLowerCase() === "#fff6ed" || preset.hex.toLowerCase() === "#eab308"
                                                        ? "text-gray-900"
                                                        : "text-white"
                                                }`}
                                            />
                                        )}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Custom color picker + hex input row */}
                        <div className="flex items-center gap-2 mt-1">
                            <label
                                className={`h-10 px-3 flex items-center gap-2.5 cursor-pointer border rounded-lg transition-all shrink-0 ${
                                    isCustomColor
                                        ? "border-gray-900 bg-gray-50"
                                        : "border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                <div className="relative w-5 h-5 rounded-xs border border-black/20 shadow-2xs overflow-hidden shrink-0 flex items-center justify-center">
                                    <div className="w-full h-full" style={{ backgroundColor: validColor }} />
                                    {isCustomColor && (
                                        <CheckIcon
                                            weight="bold"
                                            className={`absolute text-xs pointer-events-none drop-shadow ${
                                                validColor.toLowerCase() === "#fff6ed" ||
                                                validColor.toLowerCase() === "#ffffff" ||
                                                validColor.toLowerCase() === "#eab308"
                                                    ? "text-gray-900"
                                                    : "text-white"
                                            }`}
                                        />
                                    )}
                                    <input
                                        type="color"
                                        value={validColor}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                    />
                                </div>
                                <span className="text-xs text-gray-700 font-medium select-none">Cor personalizada</span>
                            </label>

                            <div className="flex-1 h-10 flex items-center border border-gray-300 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white">
                                <span className="text-gray-400 text-xs font-mono mr-1.5 select-none">HEX</span>
                                <input
                                    type="text"
                                    value={color}
                                    onChange={(e) => handleHexInput(e.target.value)}
                                    maxLength={7}
                                    placeholder="#C58852"
                                    className="w-full text-xs font-mono uppercase text-gray-800 focus:outline-none bg-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Live Preview Box */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5 flex flex-col gap-1.5">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Visualização da tag
                        </span>
                        <div className="flex items-center gap-2 pt-1">
                            <CategoryBadge
                                name={name.trim() || "Exemplo de Categoria"}
                                color={validColor}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end items-center gap-2 pt-2 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleCloseAttempt}
                            disabled={isSaving}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || name.trim().length === 0}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-xs"
                        >
                            {isSaving ? "Salvando..." : isEditing ? "Salvar Alterações" : "Criar Categoria"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CategoryModal
