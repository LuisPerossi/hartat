import type { Route } from "./+types/programacao";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Programação — Espaço Hartãt" }];
}

export default function Programacao() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-serif text-4xl font-bold">Programação do Espaço</h1>
    </section>
  );
}
