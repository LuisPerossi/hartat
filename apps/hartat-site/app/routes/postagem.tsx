import type { Route } from "./+types/postagem";

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `${params.slug} — Espaço Hartãt` }];
}

export default function Postagem({ params }: Route.ComponentProps) {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-serif text-4xl font-bold">{params.slug}</h1>
    </section>
  );
}
