import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/ssr/CalendarBlank";
import { XIcon } from "@phosphor-icons/react/dist/ssr/X";
import type { Event } from "@hartat/types/events";
import type { Route } from "./+types/programacao";
import { cloudflareContext } from "@/lib/cloudflare.server";
import { createApiClient } from "@/lib/api";
import {
  eventOccursOnDate,
  formatDateKeyShort,
  getEventVisualStatus,
  isEventActiveOrUpcoming,
  isoToDateKey,
  parseDateKey,
} from "@/lib/events";
import { EventCalendar } from "@/components/events/EventCalendar";
import { EventCard } from "@/components/events/EventCard";

type AgendaFilter = "active" | "ongoing" | "all";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Programação — Espaço Hartãt" },
    {
      name: "description",
      content:
        "Confira as exposições, eventos especiais e a agenda regular do Espaço Hartãt em Caraguatatuba.",
    },
    { property: "og:title", content: "Programação — Espaço Hartãt" },
    {
      property: "og:description",
      content:
        "Exposições, eventos especiais e agenda regular do Espaço Hartãt.",
    },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const apiUrl = env.API_URL;
  const api = createApiClient(apiUrl, env.API);
  const todayKey = isoToDateKey(new Date().toISOString());

  let specialEvents: Event[] = [];
  let regularEvents: Event[] = [];

  try {
    const [specialRes, regularRes] = await Promise.all([
      api.getEvents(
        new URLSearchParams({
          type: "special",
          limit: "100",
          sort: "dateStart",
          order: "asc",
        }),
      ),
      api.getEvents(
        new URLSearchParams({
          type: "regular",
          limit: "100",
          sort: "dateStart",
          order: "asc",
        }),
      ),
    ]);

    specialEvents = specialRes.data?.events ?? [];
    regularEvents = regularRes.data?.events ?? [];
  } catch (error) {
    console.error("Failed to fetch events:", error);
  }

  return { specialEvents, regularEvents, todayKey, apiUrl };
}

export default function Programacao({ loaderData }: Route.ComponentProps) {
  const { specialEvents, regularEvents, todayKey, apiUrl } = loaderData;
  const initial = parseDateKey(todayKey);

  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [agendaFilter, setAgendaFilter] = useState<AgendaFilter>("active");
  const [calendarOpen, setCalendarOpen] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!calendarOpen) return;
    function handleOutsideClick(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setCalendarOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setCalendarOpen(false);
    }
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [calendarOpen]);

  const visibleSpecial = useMemo(() => {
    if (selectedDate) {
      return specialEvents.filter((ev) => eventOccursOnDate(ev, selectedDate));
    }
    return specialEvents.filter((ev) => isEventActiveOrUpcoming(ev, todayKey));
  }, [specialEvents, selectedDate, todayKey]);

  const visibleRegular = useMemo(() => {
    if (selectedDate) {
      return regularEvents.filter((ev) => eventOccursOnDate(ev, selectedDate));
    }
    if (agendaFilter === "ongoing") {
      return regularEvents.filter(
        (ev) => getEventVisualStatus(ev, todayKey) === "ongoing",
      );
    }
    if (agendaFilter === "all") {
      return [...regularEvents].sort(
        (a, b) =>
          new Date(b.dateStart).getTime() - new Date(a.dateStart).getTime(),
      );
    }
    return regularEvents.filter((ev) => isEventActiveOrUpcoming(ev, todayKey));
  }, [regularEvents, selectedDate, agendaFilter, todayKey]);

  const handleSelectDate = (dateKey: string | null) => {
    setSelectedDate(dateKey);
    setCalendarOpen(false);
  };

  const handleJumpToday = () => {
    const t = parseDateKey(todayKey);
    setViewYear(t.year);
    setViewMonth(t.month);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-12">
      {/* Page Header + Calendar Popover Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl font-bold text-ink lg:text-4xl">
          Programação
        </h1>

        <div ref={popoverRef} className="relative flex items-center gap-2">
          {selectedDate && (
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              aria-label="Limpar filtro de data"
              className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-secondary px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-ink"
            >
              <XIcon size={13} weight="bold" aria-hidden="true" />
              <span>Limpar data</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setCalendarOpen((prev) => !prev)}
            aria-expanded={calendarOpen}
            className={[
              "inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-xs transition-colors",
              selectedDate || calendarOpen
                ? "border-secondary bg-secondary text-white"
                : "border-[#E2CBB0] bg-[#FAF0E4] text-ink hover:bg-[#F2E2CE]",
            ].join(" ")}
          >
            <CalendarBlankIcon size={18} weight="bold" aria-hidden="true" />
            <span>
              {selectedDate
                ? formatDateKeyShort(selectedDate)
                : "Filtrar por data"}
            </span>
          </button>

          {calendarOpen && (
            <div className="absolute top-full right-0 z-30 mt-2 w-[320px] sm:w-85">
              <EventCalendar
                viewYear={viewYear}
                viewMonth={viewMonth}
                selectedDate={selectedDate}
                todayKey={todayKey}
                specialEvents={specialEvents}
                regularEvents={regularEvents}
                onChangeMonth={(y, m) => {
                  setViewYear(y);
                  setViewMonth(m);
                }}
                onSelectDate={handleSelectDate}
                onJumpToday={handleJumpToday}
              />
            </div>
          )}
        </div>
      </div>

      {/* Pinned Special Events ("Em Cartaz") */}
      {(visibleSpecial.length > 0 || selectedDate) && (
        <section aria-labelledby="heading-especiais" className="mt-10">
          <h2
            id="heading-especiais"
            className="font-serif text-2xl font-bold text-ink lg:text-3xl"
          >
            Eventos Especiais
          </h2>

          <div className="mt-5 space-y-6">
            {visibleSpecial.length > 0 ? (
              visibleSpecial.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  apiUrl={apiUrl}
                  todayKey={todayKey}
                  variant="special"
                />
              ))
            ) : (
              <p className="rounded-2xl border border-primary/20 bg-[#F4E1CD]/50 px-6 py-8 text-sm text-secondary">
                Nenhum evento especial em{" "}
                {selectedDate ? formatDateKeyShort(selectedDate) : "destaque"}.
              </p>
            )}
          </div>
        </section>
      )}

      {/* Regular Events Agenda */}
      <section aria-labelledby="heading-agenda" className="mt-12 lg:mt-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2
            id="heading-agenda"
            className="font-serif text-2xl font-bold text-ink lg:text-3xl"
          >
            Agenda
          </h2>

          {!selectedDate && (
            <div
              role="tablist"
              aria-label="Filtrar agenda"
              className="flex items-center gap-2"
            >
              {(
                [
                  { id: "active", label: "Próximos" },
                  { id: "ongoing", label: "Em andamento" },
                  { id: "all", label: "Todos" },
                ] as const
              ).map((tab) => {
                const isActive = agendaFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setAgendaFilter(tab.id)}
                    className={[
                      "cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                      isActive
                        ? "border-secondary bg-secondary text-white shadow-xs"
                        : "border-[#E2CBB0] bg-[#FAF0E4] text-ink hover:bg-[#F2E2CE]",
                    ].join(" ")}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 space-y-4">
          {visibleRegular.length > 0 ? (
            visibleRegular.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                apiUrl={apiUrl}
                todayKey={todayKey}
                variant="regular"
              />
            ))
          ) : (
            <div className="rounded-3xl border border-primary/20 bg-[#F4E1CD]/60 px-6 py-12 text-center">
              <p className="font-serif text-lg font-bold text-ink">
                {selectedDate
                  ? `Nenhum evento regular em ${formatDateKeyShort(selectedDate)}`
                  : "Nenhum evento encontrado neste filtro"}
              </p>
              <p className="mt-1 text-sm text-secondary">
                {selectedDate
                  ? "Você pode limpar a data para voltar à programação geral."
                  : "Em breve divulgaremos novas atividades do Espaço Hartãt."}
              </p>
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="mt-4 cursor-pointer rounded-full bg-secondary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-ink"
                >
                  Ver próximos eventos
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
