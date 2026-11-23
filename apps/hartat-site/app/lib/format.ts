import type { BannerAlignment } from "@hartat/types/posts";

export const DEFAULT_FALLBACK_IMAGE = "/images/hero-banner.webp";

const ALIGNMENT_CLASSES: Record<BannerAlignment, string> = {
  top: "object-top",
  center: "object-center",
  bottom: "object-bottom",
};

export function getBannerAlignmentClass(
  alignment?: BannerAlignment | null,
): string {
  if (!alignment) return "object-center";
  return ALIGNMENT_CLASSES[alignment] ?? "object-center";
}

export function getImageUrl(
  apiUrl: string,
  key?: string | null,
  options?: { preview?: boolean },
): string | null {
  if (!key) return null;
  const base = apiUrl.replace(/\/+$/, "");
  const suffix = options?.preview ? "?preview" : "";
  return `${base}/images/${encodeURIComponent(key)}${suffix}`;
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeCategoryKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatPostDate(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatShortDate(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function isPostModified(createdAt: string, updatedAt: string): boolean {
  const created = new Date(createdAt).getTime();
  const updated = new Date(updatedAt).getTime();
  if (Number.isNaN(created) || Number.isNaN(updated)) return false;
  return updated - created > 60_000;
}
