import { Link } from "react-router";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/ssr/CalendarBlank";
import type { Post } from "@hartat/types/posts";
import {
  formatShortDate,
  getBannerAlignmentClass,
  getImageUrl,
  stripHtml,
} from "@/lib/format";
import { CategoryBadge } from "@/components/ui/CategoryBadge";

interface PostCardProps {
  post: Post;
  apiUrl: string;
}

export function PostCard({ post, apiUrl }: PostCardProps) {
  const imageUrl = getImageUrl(apiUrl, post.image?.key, { preview: true });
  const summary = post.excerpt?.trim() || stripHtml(post.content);
  const formattedDate = formatShortDate(post.createdAt);

  return (
    <Link
      to={`/postagens/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl bg-[#F4E1CD] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-primary/25">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={post.title}
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${getBannerAlignmentClass(post.bannerAlignment)}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm font-medium text-secondary">
            Espaço Hartãt
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {post.category ? (
            <CategoryBadge
              name={post.category.name}
              color={post.category.color}
            />
          ) : (
            <span />
          )}

          {formattedDate && (
            <span className="inline-flex items-center gap-1 text-xs text-secondary">
              <CalendarBlankIcon size={14} aria-hidden="true" />
              <time dateTime={post.createdAt}>{formattedDate}</time>
            </span>
          )}
        </div>

        <h2 className="mt-3 line-clamp-2 font-serif text-xl font-bold leading-snug text-ink transition-colors group-hover:text-secondary">
          {post.title}
        </h2>

        {summary && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-black/80">
            {summary}
          </p>
        )}
      </div>
    </Link>
  );
}
