import { Form, Link, useSearchParams } from "react-router";
import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr/CaretDown";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/ssr/CaretLeft";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr/CaretRight";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import type { Category } from "@hartat/types/categories";
import type { Post } from "@hartat/types/posts";
import type { Pagination } from "@hartat/types/shared";
import type { Route } from "./+types/postagens";
import { cloudflareContext } from "@/lib/cloudflare.server";
import { createApiClient } from "@/lib/api";
import { normalizeCategoryKey } from "@/lib/format";
import { PostCard } from "@/components/posts/PostCard";
import {
  getContrastTextColor,
  getValidCategoryColor,
} from "@/components/ui/CategoryBadge";

const PAGE_LIMIT = 12;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Postagens — Espaço Hartãt" },
    {
      name: "description",
      content: "Notícias, exposições, projetos e artigos do Espaço Hartãt.",
    },
  ];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const apiUrl = env.API_URL;
  const api = createApiClient(apiUrl);

  const url = new URL(request.url);
  const rawCategories = url.searchParams
    .getAll("categoria")
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter(Boolean);
  const search = url.searchParams.get("q")?.trim() ?? "";
  const sortParam = url.searchParams.get("ordem") === "title" ? "title" : "date";
  const pageParam = Math.max(
    1,
    Number.parseInt(url.searchParams.get("pagina") ?? "1", 10) || 1,
  );

  let categories: Category[] = [];
  let posts: Post[] = [];
  let pagination: Pagination = {
    page: pageParam,
    limit: PAGE_LIMIT,
    totalItems: 0,
    totalPages: 1,
  };

  try {
    const categoriesRes = await api.getCategories();
    categories = categoriesRes.data?.categories ?? [];
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }

  const requestedKeys = new Set(rawCategories.map(normalizeCategoryKey));
  const activeCategories = categories.filter((cat) =>
    requestedKeys.has(normalizeCategoryKey(cat.name)),
  );

  try {
    if (activeCategories.length <= 1) {
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: String(PAGE_LIMIT),
        sort: sortParam,
        order: sortParam === "title" ? "asc" : "desc",
      });

      if (activeCategories.length === 1) {
        params.set("categoryId", String(activeCategories[0].id));
      }
      if (search) {
        params.set("search", search);
      }

      const postsRes = await api.getPosts(params);
      posts = postsRes.data?.posts ?? [];
      if (postsRes.data?.pagination) {
        pagination = postsRes.data.pagination;
      }
    } else {
      // Multi-category selection: fetch per selected category and merge
      const responses = await Promise.all(
        activeCategories.map((cat) => {
          const params = new URLSearchParams({
            categoryId: String(cat.id),
            page: "1",
            limit: "100",
            sort: sortParam,
            order: sortParam === "title" ? "asc" : "desc",
          });
          if (search) {
            params.set("search", search);
          }
          return api.getPosts(params);
        }),
      );

      const seen = new Set<number>();
      const merged: Post[] = [];
      for (const res of responses) {
        for (const post of res.data?.posts ?? []) {
          if (!seen.has(post.id)) {
            seen.add(post.id);
            merged.push(post);
          }
        }
      }

      if (sortParam === "title") {
        merged.sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
      } else {
        merged.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      }

      const totalItems = merged.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_LIMIT));
      const safePage = Math.min(pageParam, totalPages);
      const start = (safePage - 1) * PAGE_LIMIT;

      posts = merged.slice(start, start + PAGE_LIMIT);
      pagination = {
        page: safePage,
        limit: PAGE_LIMIT,
        totalItems,
        totalPages,
      };
    }
  } catch (error) {
    console.error("Failed to fetch posts:", error);
  }

  return {
    posts,
    pagination,
    categories,
    activeCategories,
    hasRawCategoryFilter: rawCategories.length > 0,
    search,
    sort: sortParam,
    apiUrl,
  };
}

export default function Postagens({ loaderData }: Route.ComponentProps) {
  const {
    posts,
    pagination,
    categories,
    activeCategories,
    hasRawCategoryFilter,
    search,
    sort,
    apiUrl,
  } = loaderData;
  const [searchParams] = useSearchParams();

  const activeCategoryIds = new Set(activeCategories.map((c) => c.id));

  function buildToggleCategoryUrl(categoryName: string) {
    const next = new URLSearchParams();
    if (search) next.set("q", search);
    if (sort !== "date") next.set("ordem", sort);

    const targetKey = normalizeCategoryKey(categoryName);
    const alreadySelected = activeCategories.some(
      (c) => normalizeCategoryKey(c.name) === targetKey,
    );

    const nextCategories = alreadySelected
      ? activeCategories
          .filter((c) => normalizeCategoryKey(c.name) !== targetKey)
          .map((c) => c.name)
      : [...activeCategories.map((c) => c.name), categoryName];

    for (const name of nextCategories) {
      next.append("categoria", name);
    }

    const qs = next.toString();
    return qs ? `/postagens?${qs}` : "/postagens";
  }

  function buildClearCategoriesUrl() {
    const next = new URLSearchParams();
    if (search) next.set("q", search);
    if (sort !== "date") next.set("ordem", sort);
    const qs = next.toString();
    return qs ? `/postagens?${qs}` : "/postagens";
  }

  function buildPageUrl(page: number) {
    const next = new URLSearchParams(searchParams);
    if (page <= 1) {
      next.delete("pagina");
    } else {
      next.set("pagina", String(page));
    }
    const qs = next.toString();
    return qs ? `/postagens?${qs}` : "/postagens";
  }

  const hasFilters = Boolean(
    activeCategories.length > 0 || hasRawCategoryFilter || search,
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-12">
      {/* Header: Title left, Search + Sort right */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="font-serif text-3xl font-bold text-ink lg:text-4xl">
          Postagens
        </h1>

        <Form
          method="get"
          action="/postagens"
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          {activeCategories.map((cat) => (
            <input
              key={cat.id}
              type="hidden"
              name="categoria"
              value={cat.name}
            />
          ))}

          <div className="relative flex-1 sm:w-64 sm:flex-none">
            <MagnifyingGlassIcon
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-secondary"
            />
            <input
              type="search"
              name="q"
              defaultValue={search}
              placeholder="Buscar postagens..."
              aria-label="Buscar postagens"
              className="w-full rounded-full border border-primary/40 bg-white/80 py-2 pr-4 pl-10 text-sm text-ink placeholder:text-secondary/70 focus:border-secondary focus:outline-none"
            />
          </div>

          <div className="relative">
            <select
              name="ordem"
              defaultValue={sort}
              aria-label="Ordenar por"
              onChange={(e) => e.currentTarget.form?.requestSubmit()}
              className="w-full cursor-pointer appearance-none rounded-full border border-primary/40 bg-white/80 py-2 pr-10 pl-4 text-sm font-medium text-ink focus:border-secondary focus:outline-none sm:w-auto"
            >
              <option value="date">Mais recentes</option>
              <option value="title">Ordem alfabética</option>
            </select>
            <CaretDownIcon
              size={15}
              weight="bold"
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-secondary"
            />
          </div>
        </Form>
      </div>

      {/* Multi-select Category Filter Pills */}
      {categories.length > 0 && (
        <nav aria-label="Filtrar por categoria" className="mt-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to={buildClearCategoriesUrl()}
              className={[
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                activeCategories.length === 0
                  ? "border-secondary bg-secondary text-white shadow-xs"
                  : "border-primary/40 bg-[#F4E1CD]/70 text-ink hover:bg-[#F4E1CD]",
              ].join(" ")}
            >
              Todas
            </Link>

            {categories.map((category) => {
              const isSelected = activeCategoryIds.has(category.id);
              const color = getValidCategoryColor(category.color);
              const contrast = getContrastTextColor(color);

              return (
                <Link
                  key={category.id}
                  to={buildToggleCategoryUrl(category.name)}
                  aria-pressed={isSelected}
                  className="inline-flex items-center gap-2 rounded-full border-2 px-4 py-1.5 text-sm font-medium transition-all hover:opacity-90"
                  style={
                    isSelected
                      ? {
                          backgroundColor: color,
                          borderColor: color,
                          color: contrast,
                        }
                      : {
                          backgroundColor: "rgba(255, 255, 255, 0.7)",
                          borderColor: color,
                          color: "#3d2520",
                        }
                  }
                >
                  {!isSelected && (
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  )}
                  <span>{category.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} apiUrl={apiUrl} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-3xl bg-[#F4E1CD]/60 px-6 py-14 text-center">
          <p className="font-serif text-xl font-bold text-ink">
            Nenhuma postagem encontrada
          </p>
          <p className="mt-2 text-sm text-secondary">
            {hasFilters
              ? "Tente ajustar os filtros ou buscar por outro termo."
              : "Ainda não há postagens publicadas."}
          </p>
          {hasFilters && (
            <Link
              to="/postagens"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-secondary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink"
            >
              Limpar filtros
            </Link>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <nav
          aria-label="Paginação"
          className="mt-12 flex items-center justify-center gap-4"
        >
          {pagination.page > 1 ? (
            <Link
              to={buildPageUrl(pagination.page - 1)}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-[#F4E1CD]/70 px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-[#F4E1CD]"
            >
              <CaretLeftIcon size={16} weight="bold" aria-hidden="true" />
              <span>Anterior</span>
            </Link>
          ) : (
            <span className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-primary/20 px-4 py-2 text-sm font-medium text-secondary/50">
              <CaretLeftIcon size={16} weight="bold" aria-hidden="true" />
              <span>Anterior</span>
            </span>
          )}

          <span className="text-sm font-medium text-secondary">
            Página {pagination.page} de {pagination.totalPages}
          </span>

          {pagination.page < pagination.totalPages ? (
            <Link
              to={buildPageUrl(pagination.page + 1)}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-[#F4E1CD]/70 px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-[#F4E1CD]"
            >
              <span>Próxima</span>
              <CaretRightIcon size={16} weight="bold" aria-hidden="true" />
            </Link>
          ) : (
            <span className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-primary/20 px-4 py-2 text-sm font-medium text-secondary/50">
              <span>Próxima</span>
              <CaretRightIcon size={16} weight="bold" aria-hidden="true" />
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
