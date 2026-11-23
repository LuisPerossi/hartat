import { Link } from "react-router";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/ssr/CalendarBlank";
import { ImageIcon } from "@phosphor-icons/react/dist/ssr/Image";
import type { Route } from "./+types/sobre";

const HIGHLIGHTS = [
  { value: "+2.000", label: "peças no acervo privado" },
  { value: "60", label: "etnias brasileiras e culturas latino-americanas" },
  { value: "MinC 2024", label: "certificado oficial como Ponto de Cultura" },
] as const;

const FOUNDERS = [
  {
    name: "Carlo Cury",
    role: "Arquiteto, artista plástico e ceramista",
    photo: "/images/sobre/carlo.jpg",
    bio: "Arquiteto de formação, atua como artista plástico e ceramista desde 2012. É o responsável pela curadoria das peças, elaboração das expografias, produção das réplicas arqueológicas e pela condução das oficinas de cerâmica.",
  },
  {
    name: "Claudio Luiz Dias",
    role: "Engenheiro Agrônomo e cofundador",
    photo: "/images/sobre/claudio.png",
    bio: "Engenheiro Agrônomo, organiza e participa ativamente das expedições pelo Brasil e pelo exterior para conhecer etnias, museus e espaços culturais, viabilizando a ampliação da coleção. É dele também a responsabilidade pelo registro visual e escrito das atividades desenvolvidas.",
  },
] as const;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sobre — Espaço Hartãt" },
    {
      name: "description",
      content:
        "Conheça a história, o propósito e os idealizadores do Espaço Hartãt — Ponto de Cultura e acervo indígena em Caraguatatuba, SP.",
    },
    { property: "og:title", content: "Sobre — Espaço Hartãt" },
    {
      property: "og:description",
      content:
        "Lugar de memória, arte e encontro. Mais de duas mil peças de 60 etnias brasileiras e culturas da América Latina.",
    },
  ];
}

export default function Sobre() {
  return (
    <div>
      {/* Editorial Hero Banner */}
      <section className="relative flex min-h-[260px] w-full items-center justify-center overflow-hidden sm:min-h-[320px] lg:min-h-[360px]">
        <img
          src="/images/maloca-interior.png"
          alt="Interior da maloca do Espaço Hartãt"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-ink/60 shadow-[inset_0_0_60px_20px_rgba(0,0,0,0.4)]"
        />

        <div className="relative z-10 mx-auto max-w-4xl px-6 py-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FFDBB8] sm:text-sm">
            Sobre o Espaço Hartãt
          </p>
          <h1 className="mt-3 font-serif text-2xl font-bold leading-snug text-balance text-white drop-shadow-sm sm:text-3xl lg:text-4xl">
            Lugar de memória, arte e encontro.
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl space-y-14 px-6 py-10 lg:space-y-16 lg:px-10 lg:py-14">
        {/* Key Numbers Strip */}
        <section aria-label="Destaques do acervo">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-6">
            {HIGHLIGHTS.map((item) => (
              <div
                key={item.value}
                className="rounded-2xl border border-[#E8D5BF] bg-[#FAF0E4] px-6 py-5 text-center shadow-xs"
              >
                <p className="font-serif text-2xl font-bold text-ink sm:text-3xl">
                  {item.value}
                </p>
                <p className="mt-1 text-sm text-secondary">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Propósito */}
        <section aria-labelledby="heading-proposito">
          <h2
            id="heading-proposito"
            className="font-serif text-3xl font-bold text-ink lg:text-4xl"
          >
            Propósito
          </h2>
          <p className="mt-5 text-justify text-base leading-relaxed text-black/85 sm:text-lg">
            O Espaço Hartãt é um Ponto de Cultura focado na valorização,
            divulgação, manutenção e preservação das culturas indígenas
            latino-americanas. Localizado em Caraguatatuba, São Paulo, o local
            possui uma estrutura em formato de maloca que abriga um acervo
            privado com cerca de 2.000 peças. A coleção reúne obras originais e
            réplicas arqueológicas de 60 etnias brasileiras e de culturas de
            povos do Peru, Equador, Costa Rica, Colômbia e México. O espaço
            democratiza o acesso à cultura por meio de exposições — com
            expografias que mudam a cada equinócio e solstício —, oficinas de
            arte e exibições audiovisuais do projeto Cine Hartãt. É um ambiente
            inclusivo criado para todos os públicos, com forte atuação no
            recebimento de estudantes da rede pública de ensino.
          </p>
        </section>

        {/* Nossa História */}
        <section aria-labelledby="heading-historia">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <h2
                id="heading-historia"
                className="font-serif text-3xl font-bold text-ink lg:text-4xl"
              >
                Nossa História
              </h2>
              <p className="mt-5 text-justify text-base leading-relaxed text-black/85 sm:text-lg">
                A raiz do acervo começou a ganhar forma em 2012, impulsionada
                por viagens nacionais e internacionais voltadas ao estudo e à
                aquisição de peças, a exemplo do encontro com a tradição da
                Cerâmica Tapajônica no Pará. Com o amadurecimento do projeto, a
                iniciativa passou a receber visitas de escolas a partir de 2018.
                Para acomodar a crescente coleção e expandir as atividades, o
                espaço expositivo atual foi construído e oficialmente inaugurado
                em 9 de agosto de 2022, data em que se celebra o Dia
                Internacional dos Povos Indígenas. O impacto e a seriedade do
                projeto culminaram em sua certificação oficial como Ponto de
                Cultura pelo Ministério da Cultura (MinC) no ano de 2024.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-3xl border border-[#E8D5BF] bg-[#FAF0E4] shadow-md">
                <img
                  src="/images/sobre/historia.jpg"
                  alt="Registro histórico do Espaço Hartãt"
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Idealizadores */}
        <section aria-labelledby="heading-fundadores">
          <h2
            id="heading-fundadores"
            className="font-serif text-3xl font-bold text-ink lg:text-4xl"
          >
            Idealizadores
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
            {FOUNDERS.map((person) => (
              <article
                key={person.name}
                className="flex flex-col gap-5 rounded-3xl border border-[#E8D5BF] bg-[#FAF0E4] p-6 shadow-xs sm:flex-row sm:items-start sm:p-7"
              >
                <img
                  src={person.photo}
                  alt={person.name}
                  loading="lazy"
                  className="h-28 w-28 shrink-0 rounded-2xl object-cover shadow-sm sm:h-32 sm:w-32"
                />

                <div>
                  <h3 className="font-serif text-2xl font-bold text-ink">
                    {person.name}
                  </h3>
                  <p className="mt-0.5 text-sm font-medium text-secondary">
                    {person.role}
                  </p>
                  <p className="mt-3 text-justify text-sm leading-relaxed text-black/85 sm:text-base">
                    {person.bio}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Valores e Visão */}
        <section aria-labelledby="heading-valores">
          <h2
            id="heading-valores"
            className="font-serif text-3xl font-bold text-ink lg:text-4xl"
          >
            Valores e Visão
          </h2>

          <div className="mt-5 space-y-4 text-justify text-base leading-relaxed text-black/85 sm:text-lg">
            <p>
              Além de seus mantenedores, a maloca funciona como sede
              colaborativa para diversos coletivos culturais da região,
              incluindo o Grupo Ubuntu Caraguatatuba Cerâmica e Artes, o Grupo
              Tradições e Saberes Artesanais e o Grupo Caraguatatubense de
              Estudos de Questões Indígenas (GCE-TG).
            </p>
            <p>
              O Espaço Hartãt acredita na sustentabilidade cultural e no apoio
              comunitário. Isso se reflete de forma prática em sua loja física:
              toda a renda obtida com a venda de ornamentos e artesanatos é
              integralmente revertida para a compra de novos materiais,
              estimulando de forma direta o fazer tradicional das aldeias. Mais
              do que uma exposição, o local é um ponto de intercâmbio vivo que
              abraça a inclusão, recebendo desde pacientes da saúde municipal e
              professores em atividades de formação, até a promoção de vivências
              imersivas com os próprios indígenas.
            </p>
          </div>
        </section>

        {/* Free Visit Callout */}
        <section aria-label="Visitação gratuita">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-[#E2CBB0] bg-[#F4E1CD] p-6 shadow-sm sm:p-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p className="font-serif text-xl font-bold text-ink sm:text-2xl">
                Visite o Espaço Hartãt gratuitamente
              </p>
              <p className="mt-2 text-justify text-sm leading-relaxed text-secondary sm:text-base">
                As visitas ao acervo e a participação nas atividades são
                totalmente gratuitas e podem ser realizadas mediante agendamento
                prévio.
              </p>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:min-w-[220px]">
              <Link
                to="/programacao"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-accent/90 sm:text-base"
              >
                <CalendarBlankIcon size={18} weight="bold" aria-hidden="true" />
                <span>Ver programação</span>
              </Link>
              <Link
                to="/postagens?categoria=Acervo"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-ink sm:text-base"
              >
                <ImageIcon size={18} weight="bold" aria-hidden="true" />
                <span>Explorar acervo</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
