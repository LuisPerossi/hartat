import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Espaço Hartãt — Acervo Indígena" },
    {
      name: "description",
      content:
        "O maior acervo de peças indígenas de todo o Litoral Norte, em Caraguatatuba - SP.",
    },
  ];
}

export default function Home() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-serif text-4xl font-bold">Espaço Hartãt</h1>
    </section>
  );
}
