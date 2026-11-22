import { TagIcon } from "@phosphor-icons/react"

interface CategoryBadgeProps {
    name: string
    color?: string | null
    className?: string
    showIcon?: boolean
}

/**
 * Calculates accessible text color based on background luminance (YIQ standard).
 */
function getContrastTextColor(hexColor: string): string {
    const hex = hexColor.replace("#", "")
    if (hex.length < 6) return "#ffffff"
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    const yiq = (r * 299 + g * 587 + b * 114) / 1000
    return yiq >= 140 ? "#111827" : "#ffffff"
}

function CategoryBadge({
    name,
    color,
    className = "",
    showIcon = true
}: CategoryBadgeProps) {
    const validColor = color && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color) ? color : "#C58852"
    const textColor = getContrastTextColor(validColor)

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 shadow-xs border border-black/10 ${className}`}
            style={{
                backgroundColor: validColor,
                color: textColor
            }}
        >
            {showIcon && <TagIcon className="text-xs shrink-0" />}
            <span className="truncate max-w-[160px]">{name}</span>
        </span>
    )
}

export default CategoryBadge
