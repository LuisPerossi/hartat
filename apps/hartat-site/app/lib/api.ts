import type { GetCategoriesResponse } from "@hartat/types/categories";
import type { GetEventResponse, GetEventsResponse } from "@hartat/types/events";
import type { GetImagesResponse } from "@hartat/types/images";
import type { GetPostResponse, GetPostsResponse } from "@hartat/types/posts";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function createApiClient(baseUrl: string) {
  const normalizedBase = baseUrl.replace(/\/+$/, "");

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${normalizedBase}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...init?.headers,
      },
    });

    if (!res.ok) {
      let message = res.statusText;
      try {
        const body = (await res.json()) as { message?: string };
        if (body.message) message = body.message;
      } catch {
        // ignore non-JSON error body
      }
      throw new ApiError(res.status, message);
    }

    return res.json() as Promise<T>;
  }

  return {
    getPosts: (params?: URLSearchParams) =>
      request<GetPostsResponse>(`/posts${params ? `?${params}` : ""}`),
    getPostBySlug: (slug: string) =>
      request<GetPostResponse>(`/posts/slug/${encodeURIComponent(slug)}`),
    getEvents: (params?: URLSearchParams) =>
      request<GetEventsResponse>(`/events${params ? `?${params}` : ""}`),
    getEventById: (id: string | number) =>
      request<GetEventResponse>(`/events/${id}`),
    getCategories: () => request<GetCategoriesResponse>("/categories"),
    getImages: (params?: URLSearchParams) =>
      request<GetImagesResponse>(`/images${params ? `?${params}` : ""}`),
  };
}
