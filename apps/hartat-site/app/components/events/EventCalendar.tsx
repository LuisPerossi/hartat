import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr/CaretDown";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/ssr/CaretLeft";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr/CaretRight";
import type { Event } from "@hartat/types/events";
import {
  buildDateKey,
  eventOccursOnDate,
  MONTH_NAMES,
  WEEKDAY_LABELS,
} from "@/lib/events";

interface EventCalendarProps {
  viewYear: number;
  viewMonth: number;
  selectedDate: string | null;
  todayKey: string;
  specialEvents: Event[];
  regularEvents: Event[];
  onChangeMonth: (year: number, month: number) => void;
  onSelectDate: (dateKey: string | null) => void;
  onJumpToday: () => void;
}

interface CalendarCell {
  dateKey: string;
  day: number;
  inCurrentMonth: boolean;
}

function buildMonthGrid(year: number, month: number): CalendarCell[] {
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: CalendarCell[] = [];

  const prevYear = month === 0 ? year - 1 : year;
  const prevMonth = month === 0 ? 11 : month - 1;
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    cells.push({
      dateKey: buildDateKey(prevYear, prevMonth, day),
      day,
      inCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      dateKey: buildDateKey(year, month, day),
      day,
      inCurrentMonth: true,
    });
  }

  const remainder = cells.length % 7;
  if (remainder !== 0) {
    const nextYear = month === 11 ? year + 1 : year;
    const nextMonth = month === 11 ? 0 : month + 1;
    const needed = 7 - remainder;
    for (let day = 1; day <= needed; day++) {
      cells.push({
        dateKey: buildDateKey(nextYear, nextMonth, day),
        day,
        inCurrentMonth: false,
      });
    }
  }

  return cells;
}

export function EventCalendar({
  viewYear,
  viewMonth,
  selectedDate,
  todayKey,
  specialEvents,
  regularEvents,
  onChangeMonth,
  onSelectDate,
  onJumpToday,
}: EventCalendarProps) {
  const cells = buildMonthGrid(viewYear, viewMonth);
  const yearOptions = Array.from({ length: 7 }, (_, idx) => viewYear - 2 + idx);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      onChangeMonth(viewYear - 1, 11);
    } else {
      onChangeMonth(viewYear, viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      onChangeMonth(viewYear + 1, 0);
    } else {
      onChangeMonth(viewYear, viewMonth + 1);
    }
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-white p-5 shadow-md">
      {/* Header: Prev, Month Select, Year Select, Next */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handlePrevMonth}
          aria-label="Mês anterior"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-secondary transition-colors hover:bg-primary/15 hover:text-ink"
        >
          <CaretLeftIcon size={18} weight="bold" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              aria-label="Mês"
              value={viewMonth}
              onChange={(e) => onChangeMonth(viewYear, Number(e.target.value))}
              className="cursor-pointer appearance-none rounded-xl border border-primary/30 bg-bg/70 py-1.5 pr-7 pl-3 text-sm font-medium text-ink focus:border-secondary focus:outline-none"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx}>
                  {name}
                </option>
              ))}
            </select>
            <CaretDownIcon
              size={13}
              weight="bold"
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-secondary"
            />
          </div>

          <div className="relative">
            <select
              aria-label="Ano"
              value={viewYear}
              onChange={(e) => onChangeMonth(Number(e.target.value), viewMonth)}
              className="cursor-pointer appearance-none rounded-xl border border-primary/30 bg-bg/70 py-1.5 pr-7 pl-3 text-sm font-medium text-ink focus:border-secondary focus:outline-none"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <CaretDownIcon
              size={13}
              weight="bold"
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-secondary"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          aria-label="Próximo mês"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-secondary transition-colors hover:bg-primary/15 hover:text-ink"
        >
          <CaretRightIcon size={18} weight="bold" aria-hidden="true" />
        </button>
      </div>

      {/* Weekday Labels */}
      <div className="mt-4 grid grid-cols-7 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <span
            key={label}
            className="py-1 text-xs font-semibold uppercase tracking-wide text-secondary/75"
          >
            {label}
          </span>
        ))}
      </div>

      {/* Day Grid */}
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const isSelected = selectedDate === cell.dateKey;
          const isToday = cell.dateKey === todayKey;
          const hasSpecial = specialEvents.some((ev) =>
            eventOccursOnDate(ev, cell.dateKey),
          );
          const hasRegular = regularEvents.some((ev) =>
            eventOccursOnDate(ev, cell.dateKey),
          );

          let dayStyle = "";
          if (isSelected) {
            dayStyle = "bg-secondary font-bold text-white shadow-sm";
          } else if (!cell.inCurrentMonth) {
            dayStyle = "text-black/30 hover:bg-black/5";
          } else if (hasSpecial && hasRegular) {
            dayStyle =
              "bg-amber-100 font-semibold text-amber-950 ring-1 ring-amber-300 hover:bg-amber-200/80";
          } else if (hasSpecial) {
            dayStyle =
              "bg-amber-100 font-semibold text-amber-900 ring-1 ring-amber-300 hover:bg-amber-200/80";
          } else if (hasRegular) {
            dayStyle =
              "bg-slate-200/80 font-semibold text-slate-800 ring-1 ring-slate-300 hover:bg-slate-200";
          } else {
            dayStyle = "font-medium text-ink hover:bg-[#F7EBDC]";
          }

          return (
            <button
              key={cell.dateKey}
              type="button"
              onClick={() => {
                if (isSelected) {
                  onSelectDate(null);
                } else {
                  onSelectDate(cell.dateKey);
                  if (!cell.inCurrentMonth) {
                    const [y, m] = cell.dateKey.split("-").map(Number);
                    onChangeMonth(y, m - 1);
                  }
                }
              }}
              aria-pressed={isSelected}
              className={[
                "relative flex h-10 w-full cursor-pointer flex-col items-center justify-center rounded-xl text-sm transition-all",
                dayStyle,
                isToday && !isSelected ? "ring-2 ring-ink/55" : "",
              ].join(" ")}
            >
              <span>{cell.day}</span>
              {(hasSpecial || hasRegular) && (
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex items-center gap-0.5"
                >
                  {hasSpecial && (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-amber-300" : "bg-amber-500"}`}
                    />
                  )}
                  {hasRegular && (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-slate-300" : "bg-slate-500"}`}
                    />
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend + Today shortcut */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#E8D5BF] pt-3 text-xs text-secondary">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span>Especial</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
            <span>Regular</span>
          </span>
        </div>

        <button
          type="button"
          onClick={onJumpToday}
          className="cursor-pointer font-semibold text-secondary underline-offset-2 hover:text-ink hover:underline"
        >
          Hoje
        </button>
      </div>
    </div>
  );
}
