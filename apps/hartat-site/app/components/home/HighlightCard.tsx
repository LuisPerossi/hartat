import { Link } from "react-router";
import type { Post } from "@hartat/types/posts";
import {
  getBannerAlignmentClass,
  getImageUrl,
  stripHtml,
} from "@/lib/format";

interface HighlightCardProps {
  post: Post;
  apiUrl: string;
}

export function HighlightCard({ post, apiUrl }: HighlightCardProps) {
  const imageUrl = getImageUrl(apiUrl, post.image?.key, { preview: true });
  const summary = post.excerpt?.trim() || stripHtml(post.content);

  return (
    <Link
      to={`/postagens/${post.slug}`}
      className="group flex w-64 shrink-0 snap-start flex-col overflow-hidden rounded-3xl bg-[#F4E1CD] shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="h-36 w-full overflow-hidden bg-primary/30">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={post.title}
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${getBannerAlignmentClass(post.bannerAlignment)}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/25 px-4 text-center text-xs font-medium text-secondary">
            Espaço Hartãt
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-lg font-medium leading-snug text-black group-hover:text-secondary">
          {post.title}
        </h3>
        {summary && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-black/85">
            {summary}
          </p>
        )}
      </div>
    </Link>
  );
}
