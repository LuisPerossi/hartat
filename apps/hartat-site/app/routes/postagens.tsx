import type { Route } from "./+types/postagens";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Postagens — Espaço Hartãt" }];
}

export default function Postagens() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-serif text-4xl font-bold">Postagens</h1>
    </section>
  );
}
