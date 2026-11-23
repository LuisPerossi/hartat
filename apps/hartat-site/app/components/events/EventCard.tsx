import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/ssr/ArrowSquareOut";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/ssr/CalendarBlank";
import { ClockIcon } from "@phosphor-icons/react/dist/ssr/Clock";
import { ImageIcon } from "@phosphor-icons/react/dist/ssr/Image";
import type { Event } from "@hartat/types/events";
import { getImageUrl } from "@/lib/format";
import {
  formatEventSchedule,
  getDateTileParts,
  getEventVisualStatus,
  isoToDateKey,
} from "@/lib/events";

interface EventCardProps {
  event: Event;
  apiUrl: string;
  todayKey: string;
  variant?: "special" | "regular";
}

const STATUS_BADGE = {
  ongoing: {
    label: "Em andamento",
    className: "bg-accent/15 text-[#236B23] border-accent/30",
  },
  upcoming: {
    label: "Em breve",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  past: {
    label: "Encerrado",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
} as const;

export function EventCard({
  event,
  apiUrl,
  todayKey,
  variant = "regular",
}: EventCardProps) {
  const imageUrl = getImageUrl(apiUrl, event.image?.key, { preview: true });
  const { dateLabel, timeLabel } = formatEventSchedule(event);
  const status = getEventVisualStatus(event, todayKey);
  const badge = STATUS_BADGE[status];

  if (variant === "special") {
    return (
      <article className="grid grid-cols-1 overflow-hidden rounded-3xl border border-[#E8D5BF] bg-[#FAF0E4] shadow-sm transition-shadow hover:shadow-md lg:grid-cols-12">
        {/* Feature Image */}
        <div className="flex h-56 items-center justify-center overflow-hidden bg-[#F2E2CE] lg:col-span-5 lg:h-auto lg:min-h-[260px]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={event.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon
              size={56}
              weight="duotone"
              aria-hidden="true"
              className="text-secondary/40"
            />
          )}
        </div>

        {/* Editorial Content */}
        <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-7">
          <div>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold ${badge.className}`}
              >
                {badge.label}
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium text-secondary">
                <CalendarBlankIcon size={16} aria-hidden="true" />
                <span>{dateLabel}</span>
              </span>
              {timeLabel && (
                <span className="inline-flex items-center gap-1.5 font-medium text-secondary">
                  <ClockIcon size={16} aria-hidden="true" />
                  <span>{timeLabel}</span>
                </span>
              )}
            </div>

            <h3 className="mt-3 font-serif text-2xl font-bold leading-snug text-ink sm:text-3xl">
              {event.title}
            </h3>

            {event.description && (
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-black/80 sm:text-base">
                {event.description}
              </p>
            )}
          </div>

          {event.url && (
            <div className="mt-6">
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-ink"
              >
                <span>Saiba mais</span>
                <ArrowSquareOutIcon size={16} weight="bold" aria-hidden="true" />
              </a>
            </div>
          )}
        </div>
      </article>
    );
  }

  // Regular Event — Editorial Agenda / Timeline Row
  const tile = getDateTileParts(event.dateStart);
  const isMultiDay = isoToDateKey(event.dateStart) !== isoToDateKey(event.dateEnd);

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-[#E8D5BF] bg-[#FBF4EB] p-4 shadow-xs transition-all hover:bg-[#F7EBDC] hover:shadow-sm sm:flex-row sm:items-stretch sm:gap-5 sm:p-5">
      {/* Left Date Tile */}
      <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:justify-center">
        <div className="flex w-20 flex-col items-center justify-center rounded-2xl bg-secondary px-2 py-2.5 text-center text-white shadow-xs sm:h-full sm:w-22 sm:py-3">
          <span className="text-[11px] font-semibold tracking-wider text-white/80">
            {tile.weekday}
          </span>
          <span className="font-serif text-2xl font-bold leading-none sm:text-3xl">
            {tile.day}
          </span>
          <span className="mt-0.5 text-xs font-semibold tracking-wider text-white/90">
            {tile.month}
          </span>
        </div>

        {/* Mobile status badge beside date tile */}
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold sm:hidden ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>

      {/* Optional Thumbnail */}
      <div className="flex h-40 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F2E2CE] sm:h-auto sm:w-44">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <ImageIcon
            size={36}
            weight="duotone"
            aria-hidden="true"
            className="text-secondary/45"
          />
        )}
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm">
          <span
            className={`hidden items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold sm:inline-flex ${badge.className}`}
          >
            {badge.label}
          </span>

          {isMultiDay && (
            <span className="inline-flex items-center gap-1 font-medium text-secondary">
              <CalendarBlankIcon size={15} aria-hidden="true" />
              <span>{dateLabel}</span>
            </span>
          )}

          {timeLabel && (
            <span className="inline-flex items-center gap-1 font-medium text-secondary">
              <ClockIcon size={15} aria-hidden="true" />
              <span>{timeLabel}</span>
            </span>
          )}
        </div>

        <h3 className="mt-1.5 font-serif text-xl font-bold leading-snug text-ink">
          {event.title}
        </h3>

        {event.description && (
          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-black/80 sm:text-base">
            {event.description}
          </p>
        )}

        {event.url && (
          <div className="mt-3">
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary underline-offset-2 transition-colors hover:text-ink hover:underline"
            >
              <span>Saiba mais</span>
              <ArrowSquareOutIcon size={15} weight="bold" aria-hidden="true" />
            </a>
          </div>
        )}
      </div>
    </article>
  );
}
