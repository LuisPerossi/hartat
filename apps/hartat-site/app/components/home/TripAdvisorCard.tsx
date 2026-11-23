import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/ssr/ArrowSquareOut";
import { MedalIcon } from "@phosphor-icons/react/dist/ssr/Medal";

const TRIPADVISOR_URL =
  "https://www.tripadvisor.com.br/Attraction_Review-g675037-d29011892-Reviews-Espaco_Hartat_Acervo_Indigena-Caraguatatuba_State_of_Sao_Paulo.html";

export function TripAdvisorCard() {
  return (
    <a
      href={TRIPADVISOR_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col items-start justify-between gap-6 rounded-3xl border border-primary/30 bg-[#F4E1CD] p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:p-8"
    >
      <div className="flex items-center gap-5">
        {/* Award seal */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#00AA6C] text-white shadow-sm">
          <MedalIcon size={36} weight="fill" aria-hidden="true" />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[#00AA6C]/15 px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-[#007A4D]">
              TripAdvisor • Travelers&apos; Choice
            </span>
            <span
              aria-hidden="true"
              className="inline-flex items-center gap-1"
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className="h-2.5 w-2.5 rounded-full bg-[#00AA6C]"
                />
              ))}
            </span>
          </div>

          <h3 className="mt-2 font-serif text-xl font-bold text-ink sm:text-2xl">
            Reconhecido pelos visitantes no TripAdvisor
          </h3>
          <p className="mt-1 text-sm text-secondary sm:text-base">
            Confira as avaliações de quem já visitou o Espaço Hartãt em
            Caraguatatuba.
          </p>
        </div>
      </div>

      <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-medium text-white transition-colors group-hover:bg-ink sm:text-base">
        <span>Ver avaliações</span>
        <ArrowSquareOutIcon size={18} weight="bold" aria-hidden="true" />
      </span>
    </a>
  );
}
