import { Link, useNavigate } from "react-router";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/ssr/CalendarBlank";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/ssr/CaretLeft";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/ssr/ClockCounterClockwise";
import type { Route } from "./+types/postagem";
import { cloudflareContext } from "@/lib/cloudflare.server";
import { ApiError, createApiClient } from "@/lib/api";
import {
  formatDateTime,
  getBannerAlignmentClass,
  getImageUrl,
  isPostModified,
  stripHtml,
} from "@/lib/format";
import { CategoryBadge } from "@/components/ui/CategoryBadge";

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData?.post) {
    return [{ title: "Postagem não encontrada — Espaço Hartãt" }];
  }

  const { post, apiUrl } = loaderData;
  const rawDescription = post.excerpt?.trim() || stripHtml(post.content);
  const description =
    rawDescription.length > 160
      ? `${rawDescription.slice(0, 157).trimEnd()}...`
      : rawDescription;
  const imageUrl = getImageUrl(apiUrl, post.image?.key);

  const tags = [
    { title: `${post.title} — Espaço Hartãt` },
    { name: "description", content: description },
    { property: "og:title", content: post.title },
    { property: "og:description", content: description },
    { property: "og:type", content: "article" },
  ];

  if (imageUrl) {
    tags.push({ property: "og:image", content: imageUrl });
  }

  return tags;
}

export async function loader({ params, context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const apiUrl = env.API_URL;
  const api = createApiClient(apiUrl, env.API);

  try {
    const response = await api.getPostBySlug(params.slug);
    const post = response.data?.post;

    if (!post) {
      throw new Response("Postagem não encontrada", { status: 404 });
    }

    return { post, apiUrl };
  } catch (error) {
    if (error instanceof Response) throw error;
    if (error instanceof ApiError && error.status === 404) {
      throw new Response("Postagem não encontrada", { status: 404 });
    }
    throw new Response("Não foi possível carregar a postagem", { status: 500 });
  }
}

export default function Postagem({ loaderData }: Route.ComponentProps) {
  const { post, apiUrl } = loaderData;
  const navigate = useNavigate();

  const bannerUrl = getImageUrl(apiUrl, post.image?.key);
  const createdDate = formatDateTime(post.createdAt);
  const modified = isPostModified(post.createdAt, post.updatedAt);
  const updatedDate = modified ? formatDateTime(post.updatedAt) : null;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/postagens");
    }
  };

  return (
    <article>
      {/* Full-bleed Cover Banner with Floating Back Pill */}
      {bannerUrl && (
        <div className="relative h-60 w-full overflow-hidden bg-primary/20 sm:h-80 lg:h-105">
          <img
            src={bannerUrl}
            alt={post.title}
            className={`h-full w-full object-cover ${getBannerAlignmentClass(post.bannerAlignment)}`}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-black/35 to-transparent"
          />
          <button
            type="button"
            onClick={handleBack}
            className="absolute top-5 left-5 inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-bg/90 px-4 py-2 text-sm font-medium text-ink shadow-md backdrop-blur-sm transition-colors hover:bg-bg lg:top-6 lg:left-8"
          >
            <CaretLeftIcon size={16} weight="bold" aria-hidden="true" />
            <span>Voltar</span>
          </button>
        </div>
      )}

      {/* Article Content — standardized max-w-7xl matching Home & Postagens */}
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-12">
        {!bannerUrl && (
          <button
            type="button"
            onClick={handleBack}
            className="mb-6 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-primary/40 bg-[#F4E1CD]/70 px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-[#F4E1CD]"
          >
            <CaretLeftIcon size={16} weight="bold" aria-hidden="true" />
            <span>Voltar</span>
          </button>
        )}

        {/* Header: Tag + Dates above, Title underneath */}
        <header className="border-b border-primary/25 pb-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-secondary">
            {post.category && (
              <Link
                to={`/postagens?categoria=${encodeURIComponent(post.category.name)}`}
                className="inline-flex transition-opacity hover:opacity-85"
              >
                <CategoryBadge
                  name={post.category.name}
                  color={post.category.color}
                />
              </Link>
            )}

            {createdDate && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarBlankIcon size={15} aria-hidden="true" />
                <time dateTime={post.createdAt}>Postado em {createdDate}</time>
              </span>
            )}

            {updatedDate && (
              <span className="inline-flex items-center gap-1.5 text-secondary/75">
                <ClockCounterClockwiseIcon size={15} aria-hidden="true" />
                <span>Modificado em {updatedDate}</span>
              </span>
            )}
          </div>

          <h1 className="mt-4 font-serif text-3xl font-bold leading-snug text-balance text-ink sm:text-4xl sm:leading-tight lg:text-5xl">
            {post.title}
          </h1>
        </header>

        {/* Rendered Rich Text (Quill HTML) */}
        <div
          className="post-content mt-8 wrap-break-word text-base leading-relaxed text-black sm:text-lg"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </article>
  );
}
