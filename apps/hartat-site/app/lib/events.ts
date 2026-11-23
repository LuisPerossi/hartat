import type { Event } from "@hartat/types/events";

export const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

export const MONTH_ABBR = [
  "JAN",
  "FEV",
  "MAR",
  "ABR",
  "MAI",
  "JUN",
  "JUL",
  "AGO",
  "SET",
  "OUT",
  "NOV",
  "DEZ",
] as const;

export const WEEKDAY_LABELS = [
  "Dom",
  "Seg",
  "Ter",
  "Qua",
  "Qui",
  "Sex",
  "Sáb",
] as const;

export function buildDateKey(year: number, month: number, day: number): string {
  const y = String(year).padStart(4, "0");
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isoToDateKey(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return isoString.slice(0, 10);
  }
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((p) => p.type === "year")?.value ?? "0000";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): {
  year: number;
  month: number;
  day: number;
} {
  const [y, m, d] = key.split("-").map((n) => Number.parseInt(n, 10));
  return {
    year: y || 2026,
    month: (m || 1) - 1,
    day: d || 1,
  };
}

export function eventOccursOnDate(event: Event, dateKey: string): boolean {
  const startKey = isoToDateKey(event.dateStart);
  const endKey = isoToDateKey(event.dateEnd);
  return dateKey >= startKey && dateKey <= endKey;
}

export function isEventActiveOrUpcoming(
  event: Event,
  todayKey: string,
): boolean {
  return isoToDateKey(event.dateEnd) >= todayKey;
}

export function formatDateKeyShort(dateKey: string): string {
  const { year, month, day } = parseDateKey(dateKey);
  return `${String(day).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}/${year}`;
}

export function formatDateKeyLong(dateKey: string): string {
  const { year, month, day } = parseDateKey(dateKey);
  return `${day} de ${MONTH_NAMES[month].toLowerCase()} de ${year}`;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getEventVisualStatus(
  event: Event,
  todayKey: string,
): "ongoing" | "upcoming" | "past" {
  const startKey = isoToDateKey(event.dateStart);
  const endKey = isoToDateKey(event.dateEnd);

  if (todayKey >= startKey && todayKey <= endKey) return "ongoing";
  if (todayKey < startKey) return "upcoming";
  return "past";
}

export function getDateTileParts(isoString: string): {
  weekday: string;
  day: string;
  month: string;
} {
  const key = isoToDateKey(isoString);
  const { year, month, day } = parseDateKey(key);
  const dow = new Date(year, month, day).getDay();
  return {
    weekday: WEEKDAY_LABELS[dow].toUpperCase(),
    day: String(day).padStart(2, "0"),
    month: MONTH_ABBR[month],
  };
}

export function formatEventSchedule(event: Event): {

  dateLabel: string;
  timeLabel: string | null;
} {
  const startKey = isoToDateKey(event.dateStart);
  const endKey = isoToDateKey(event.dateEnd);
  const startTime = formatTime(event.dateStart);
  const endTime = formatTime(event.dateEnd);

  if (startKey === endKey) {
    const timeLabel =
      startTime && endTime && startTime !== endTime
        ? `${startTime} às ${endTime}`
        : startTime || null;
    return {
      dateLabel: formatDateKeyShort(startKey),
      timeLabel,
    };
  }

  return {
    dateLabel: `${formatDateKeyShort(startKey)} - ${formatDateKeyShort(endKey)}`,
    timeLabel:
      startTime && endTime && startTime !== endTime
        ? `${startTime} às ${endTime}`
        : null,
  };
}
