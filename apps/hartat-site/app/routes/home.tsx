import { Link } from "react-router";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/ssr/CalendarBlank";
import { ImageIcon } from "@phosphor-icons/react/dist/ssr/Image";
import { MapPinIcon } from "@phosphor-icons/react/dist/ssr/MapPin";
import { NewspaperIcon } from "@phosphor-icons/react/dist/ssr/Newspaper";
import type { Post } from "@hartat/types/posts";
import type { Route } from "./+types/home";
import { cloudflareContext } from "@/lib/cloudflare.server";
import { createApiClient } from "@/lib/api";
import { HighlightCard } from "@/components/home/HighlightCard";
import { TripAdvisorCard } from "@/components/home/TripAdvisorCard";

const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2173.626266592157!2d-45.39332926689689!3d-23.61906604998831!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94cd63000dfd49ad%3A0xc121f69cd63fe898!2sPonto%20de%20Cultura%20-%20Espa%C3%A7o%20Hart%C3%A3t-%20Acervo%20Ind%C3%ADgena!5e0!3m2!1spt-BR!2sbr!4v1779816037160!5m2!1spt-BR!2sbr";

const YOUTUBE_EMBED_URL = "https://www.youtube.com/embed/Eie84qbGSmo";

const HOSTED_GROUPS = [
  {
    name: "Grupo Ubuntu Caraguatatuba: Cerâmica e Artes",
    category: "Ubuntu",
    logo: "/logos/Ubuntu.svg",
    circularBackdrop: false,
  },
  {
    name: "Grupo Caraguatatubense de Estudos de Questões Indígenas",
    category: "GCE-TG",
    logo: "/logos/GCE.svg",
    circularBackdrop: true,
  },
  {
    name: "Grupo Tradições e Saberes Artesanais",
    category: "TSA",
    logo: "/logos/TSA.svg",
    circularBackdrop: false,
  },
] as const;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Espaço Hartãt — Acervo Indígena" },
    {
      name: "description",
      content:
        "O maior acervo de peças indígenas de todo o Litoral Norte, em Caraguatatuba - SP.",
    },
    { property: "og:title", content: "Espaço Hartãt — Acervo Indígena" },
    {
      property: "og:description",
      content:
        "O maior acervo de peças indígenas de todo o Litoral Norte, em Caraguatatuba - SP.",
    },
    { property: "og:type", content: "website" },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const apiUrl = env.API_URL;
  const api = createApiClient(apiUrl);

  let highlightedPosts: Post[] = [];
  try {
    const response = await api.getPosts(
      new URLSearchParams({
        isHighlighted: "true",
        limit: "12",
        sort: "date",
        order: "desc",
      }),
    );
    highlightedPosts = response.data?.posts ?? [];
  } catch (error) {
    console.error("Failed to fetch highlighted posts:", error);
  }

  return { highlightedPosts, apiUrl };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { highlightedPosts, apiUrl } = loaderData;

  return (
    <div>
      {/* Static Hero Banner */}
      <section className="relative flex h-64 w-full items-center justify-center overflow-hidden sm:h-80 lg:h-100">
        <img
          src="/images/hero-banner.webp"
          alt="Entrada do Espaço Hartãt cercada por vegetação"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-black/30 shadow-[inset_0_0_50px_20px_rgba(0,0,0,0.35)]"
        />

        <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-6 text-center">
          <h1 className="font-serif text-2xl font-bold leading-tight text-balance text-white drop-shadow-[0_3px_2px_rgba(0,0,0,0.45)] sm:text-3xl lg:text-4xl">
            O maior acervo de peças indígenas de todo o Litoral Norte
          </h1>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="mx-auto max-w-7xl px-6 pt-6 pb-14 lg:px-10 lg:pt-8 lg:pb-20">
        {/* Quick Action Buttons */}
        <nav aria-label="Acesso rápido">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            <Link
              to="/programacao"
              className="flex items-center justify-center gap-3 rounded-2xl bg-secondary px-5 py-4 text-lg font-medium text-white shadow-sm transition-colors hover:bg-secondary/90"
            >
              <CalendarBlankIcon size={24} weight="regular" aria-hidden="true" />
              <span>Programação</span>
            </Link>

            <Link
              to="/postagens"
              className="flex items-center justify-center gap-3 rounded-2xl bg-secondary px-5 py-4 text-lg font-medium text-white shadow-sm transition-colors hover:bg-secondary/90"
            >
              <NewspaperIcon size={24} weight="regular" aria-hidden="true" />
              <span>Postagens</span>
            </Link>

            <Link
              to="/postagens?categoria=Acervo"
              className="flex items-center justify-center gap-3 rounded-2xl bg-secondary px-5 py-4 text-lg font-medium text-white shadow-sm transition-colors hover:bg-secondary/90"
            >
              <ImageIcon size={24} weight="regular" aria-hidden="true" />
              <span>Acervo Virtual</span>
            </Link>

            <a
              href="#onde-estamos"
              className="flex items-center justify-center gap-3 rounded-2xl bg-secondary px-5 py-4 text-lg font-medium text-white shadow-sm transition-colors hover:bg-secondary/90"
            >
              <MapPinIcon size={24} weight="regular" aria-hidden="true" />
              <span>Visite-nos</span>
            </a>
          </div>
        </nav>

        <div className="mt-10 space-y-14 lg:mt-12 lg:space-y-16">
          {/* Destaques (Live from API) */}
          <section aria-labelledby="heading-destaques">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2
                id="heading-destaques"
                className="font-serif text-3xl font-bold text-ink lg:text-4xl"
              >
                Destaques
              </h2>

              <Link
                to="/postagens"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary transition-colors hover:text-ink sm:text-base"
              >
                <span>Ver todas</span>
                <ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
              </Link>
            </div>

            {highlightedPosts.length > 0 ? (
              <div className="mt-6 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2">
                {highlightedPosts.map((post) => (
                  <HighlightCard key={post.id} post={post} apiUrl={apiUrl} />
                ))}
              </div>
            ) : (
              <p className="mt-6 rounded-2xl bg-[#F4E1CD]/60 px-6 py-8 text-sm text-secondary">
                Nenhum destaque publicado no momento.
              </p>
            )}
          </section>

          {/* Sobre o projeto */}
          <section aria-labelledby="heading-sobre">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col items-start">
                <h2
                  id="heading-sobre"
                  className="font-serif text-3xl font-bold text-ink lg:text-4xl"
                >
                  Sobre o projeto
                </h2>

                <p className="mt-6 text-base leading-relaxed text-black">
                  O Espaço Hartãt conta com um acervo indígena privado com mais
                  de duas mil peças de 60 etnias brasileiras e outras culturas
                  da América Latina, como Peru, Equador, Costa Rica, Colômbia e
                  México. O acervo inclui tanto obras originais, quanto réplicas
                  criadas por ceramistas com base em estudos arqueológicos das
                  culturas já extintas.
                </p>

                <Link
                  to="/sobre"
                  className="mt-6 hidden items-center justify-center rounded-full bg-accent px-8 py-3 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-accent/90 lg:inline-flex"
                >
                  Saiba mais
                </Link>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative aspect-16/10 w-full overflow-hidden rounded-3xl shadow-md">
                  <img
                    src="/images/maloca-interior.png"
                    alt="Interior da maloca do Espaço Hartãt com peças indígenas em exposição"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_4px_12px_4px_rgba(0,0,0,0.25)]"
                  />
                </div>

                <Link
                  to="/sobre"
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-accent px-8 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-accent/90 lg:hidden"
                >
                  Saiba mais
                </Link>
              </div>
            </div>
          </section>

          {/* Conheça o espaço */}
          <section aria-labelledby="heading-conheca">
            <h2
              id="heading-conheca"
              className="font-serif text-3xl font-bold text-ink lg:text-4xl"
            >
              Conheça o espaço
            </h2>

            <div className="mx-auto mt-6 aspect-video w-full max-w-3xl overflow-hidden rounded-xl shadow-md">
              <iframe
                src={YOUTUBE_EMBED_URL}
                title="Espaço Hartãt - Turismo em Caraguatatuba"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                className="h-full w-full border-0"
              />
            </div>
          </section>

          {/* Onde estamos */}
          <section
            id="onde-estamos"
            aria-labelledby="heading-onde-estamos"
            className="scroll-mt-24"
          >
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12">
              <div>
                <h2
                  id="heading-onde-estamos"
                  className="font-serif text-3xl font-bold text-ink lg:text-4xl"
                >
                  Onde estamos
                </h2>

                <div className="mt-6 space-y-4 text-base leading-relaxed text-black">
                  <div>
                    <p className="font-medium">Endereço:</p>
                    <p>Rua Bartolomeu Bueno da Silva, 1231 - Martim de Sá</p>
                    <p>Caraguatatuba, SP - 11662-300</p>
                  </div>

                  <div>
                    <p className="font-medium">Contato:</p>
                    <p>
                      TEL:{" "}
                      <a href="tel:+5512981950786" className="hover:underline">
                        +55 (12) 98195-0786
                      </a>
                    </p>
                    <p>
                      E-mail:{" "}
                      <a
                        href="mailto:ubuntucaragua@gmail.com"
                        className="hover:underline"
                      >
                        ubuntucaragua@gmail.com
                      </a>
                    </p>
                  </div>

                  <div>
                    <p className="font-medium">Horário de atendimento:</p>
                    <p>Segunda à domingo, das 9h às 12h e das 14h às 17h</p>
                  </div>
                </div>
              </div>

              <div className="h-72 w-full overflow-hidden rounded-xl shadow-md lg:h-80">
                <iframe
                  src={MAP_EMBED_URL}
                  title="Localização do Espaço Hartãt no Google Maps"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full border-0"
                />
              </div>
            </div>
          </section>

          {/* Reconhecimento TripAdvisor */}
          <section aria-label="Reconhecimento no TripAdvisor">
            <TripAdvisorCard />
          </section>

          {/* Grupos sediados */}
          <section aria-labelledby="heading-grupos">
            <h2
              id="heading-grupos"
              className="font-serif text-3xl font-bold text-ink lg:text-4xl"
            >
              Grupos sediados
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-3">
              {HOSTED_GROUPS.map((group) => (
                <Link
                  key={group.name}
                  to={`/postagens?categoria=${encodeURIComponent(group.category)}`}
                  className="group flex flex-col items-center rounded-2xl p-4 text-center transition-all hover:-translate-y-0.5 hover:bg-[#F4E1CD]/60"
                >
                  <div
                    className={[
                      "flex h-40 w-40 items-center justify-center p-2 transition-transform duration-200 group-hover:scale-105",
                      group.circularBackdrop ? "rounded-full bg-white" : "",
                    ].join(" ")}
                  >
                    <img
                      src={group.logo}
                      alt={group.name}
                      loading="lazy"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <p className="mt-4 max-w-xs text-base font-medium leading-snug text-black transition-colors group-hover:text-secondary lg:text-lg">
                    {group.name}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
