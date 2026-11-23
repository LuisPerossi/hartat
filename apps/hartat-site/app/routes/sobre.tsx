import type { Route } from "./+types/sobre";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Sobre — Espaço Hartãt" }];
}

export default function Sobre() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-12">
      <h1 className="font-serif text-3xl font-bold text-ink lg:text-4xl">
        Sobre
      </h1>
    </section>
  );
}
