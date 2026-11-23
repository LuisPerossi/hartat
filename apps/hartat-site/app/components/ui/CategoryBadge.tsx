interface CategoryBadgeProps {
  name: string;
  color?: string | null;
  className?: string;
  showIcon?: boolean;
}

const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function getValidCategoryColor(color?: string | null): string {
  return color && HEX_COLOR_RE.test(color) ? color : "#C58852";
}

export function getContrastTextColor(hexColor: string): string {
  let hex = hexColor.replace("#", "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (hex.length < 6) return "#ffffff";
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140 ? "#111827" : "#ffffff";
}

function TagGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="13"
      height="13"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M243.31,136,144,36.69A15.86,15.86,0,0,0,132.69,32H40a8,8,0,0,0-8,8v92.69A15.86,15.86,0,0,0,36.69,144L136,243.31a16,16,0,0,0,22.63,0l84.68-84.68a16,16,0,0,0,0-22.63Zm-96,96L48,132.69V48h84.69L232,147.31ZM96,84A12,12,0,1,1,84,72,12,12,0,0,1,96,84Z" />
    </svg>
  );
}

export function CategoryBadge({
  name,
  color,
  className = "",
  showIcon = true,
}: CategoryBadgeProps) {
  const validColor = getValidCategoryColor(color);
  const textColor = getContrastTextColor(validColor);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-black/10 px-2.5 py-0.5 text-xs font-semibold shadow-xs ${className}`}
      style={{
        backgroundColor: validColor,
        color: textColor,
      }}
    >
      {showIcon && <TagGlyph />}
      <span className="max-w-[180px] truncate">{name}</span>
    </span>
  );
}
