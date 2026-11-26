interface ProxyEnv {
    API?: Fetcher
    ADMIN_API_SECRET?: string
}

export const onRequest: PagesFunction<ProxyEnv> = async (context) => {
    const api = context.env.API
    if (!api) {
        return new Response(
            JSON.stringify({ message: "API service binding is not configured" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        )
    }

    const incomingUrl = new URL(context.request.url)
    const targetPath = incomingUrl.pathname.replace(/^\/api(?=\/|$)/, "") || "/"
    const targetUrl = new URL(`${targetPath}${incomingUrl.search}`, "https://hartat-api.internal")

    const headers = new Headers(context.request.headers)
    headers.delete("host")
    // Prevent clients from spoofing the server-to-server secret
    headers.delete("X-Admin-Secret")

    if (context.env.ADMIN_API_SECRET) {
        headers.set("X-Admin-Secret", context.env.ADMIN_API_SECRET)
    }

    const method = context.request.method.toUpperCase()
    const hasBody = method !== "GET" && method !== "HEAD"

    const upstreamRequest = new Request(targetUrl.toString(), {
        method,
        headers,
        body: hasBody ? context.request.body : undefined,
        redirect: "manual",
    })

    return await api.fetch(upstreamRequest)
}
