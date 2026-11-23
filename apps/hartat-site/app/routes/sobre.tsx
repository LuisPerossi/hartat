import type { Route } from "./+types/sobre";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Sobre — Espaço Hartãt" }];
}

export default function Sobre() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-serif text-4xl font-bold">Sobre</h1>
    </section>
  );
}
