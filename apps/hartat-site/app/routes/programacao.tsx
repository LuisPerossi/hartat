import type { Route } from "./+types/programacao";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Programação — Espaço Hartãt" }];
}

export default function Programacao() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-12">
      <h1 className="font-serif text-3xl font-bold text-ink lg:text-4xl">
        Programação do Espaço
      </h1>
    </section>
  );
}
