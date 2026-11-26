import { createMiddleware } from "hono/factory"
import { HonoEnv } from "../types/hono"

interface JwkKey extends JsonWebKey {
    kid?: string
    kty: string
}

interface AccessCertsResponse {
    keys?: JwkKey[]
}

const JWKS_CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes
let cachedJwks: { teamDomain: string; expiresAt: number; keys: JwkKey[] } | null = null

function timingSafeEqualString(a: string, b: string): boolean {
    const encoder = new TextEncoder()
    const aBytes = encoder.encode(a)
    const bBytes = encoder.encode(b)

    if (aBytes.byteLength !== bBytes.byteLength) {
        return false
    }

    return crypto.subtle.timingSafeEqual(aBytes, bBytes)
}

function base64UrlToUint8Array(input: string): Uint8Array {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")
    const binary = atob(padded)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
    }
    return bytes
}

async function getAccessJwks(teamDomain: string): Promise<JwkKey[]> {
    const now = Date.now()
    if (cachedJwks && cachedJwks.teamDomain === teamDomain && cachedJwks.expiresAt > now) {
        return cachedJwks.keys
    }

    const normalizedDomain = teamDomain.replace(/^https?:\/\//, "").replace(/\/+$/, "")
    const res = await fetch(`https://${normalizedDomain}/cdn-cgi/access/certs`)
    if (!res.ok) {
        throw new Error(`Failed to fetch Cloudflare Access JWKS (${res.status})`)
    }

    const body = (await res.json()) as AccessCertsResponse
    const keys = body.keys ?? []
    cachedJwks = { teamDomain, expiresAt: now + JWKS_CACHE_TTL_MS, keys }
    return keys
}

async function verifyAccessJwt(token: string, teamDomain: string, expectedAud: string): Promise<boolean> {
    const parts = token.split(".")
    if (parts.length !== 3) return false

    try {
        const [headerB64, payloadB64, signatureB64] = parts
        const decoder = new TextDecoder()
        const header = JSON.parse(decoder.decode(base64UrlToUint8Array(headerB64))) as {
            alg?: string
            kid?: string
        }
        const payload = JSON.parse(decoder.decode(base64UrlToUint8Array(payloadB64))) as {
            aud?: string | string[]
            exp?: number
            nbf?: number
        }

        if (header.alg !== "RS256" || !header.kid) return false

        const nowSeconds = Math.floor(Date.now() / 1000)
        if (typeof payload.exp !== "number" || payload.exp <= nowSeconds) return false
        if (typeof payload.nbf === "number" && payload.nbf > nowSeconds) return false

        const audiences = Array.isArray(payload.aud) ? payload.aud : payload.aud ? [payload.aud] : []
        if (!audiences.includes(expectedAud)) return false

        const keys = await getAccessJwks(teamDomain)
        const jwk = keys.find((k) => k.kid === header.kid)
        if (!jwk) return false

        const cryptoKey = await crypto.subtle.importKey(
            "jwk",
            jwk,
            { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
            false,
            ["verify"]
        )

        const signingInput = new TextEncoder().encode(`${headerB64}.${payloadB64}`)
        const signature = base64UrlToUint8Array(signatureB64)

        return await crypto.subtle.verify("RSASSA-PKCS1-v1_5", cryptoKey, signature, signingInput)
    } catch {
        return false
    }
}

export const adminAuth = createMiddleware<HonoEnv>(async (c, next) => {
    const expectedSecret = c.env.ADMIN_API_SECRET

    // Fail closed in production if ADMIN_API_SECRET is missing; allow local dev on localhost/127.0.0.1
    if (!expectedSecret) {
        const { hostname } = new URL(c.req.url)
        const isLocalDev = hostname === "localhost" || hostname === "127.0.0.1"
        if (isLocalDev) {
            return await next()
        }
        return c.json({ message: "Admin authentication is not configured" }, 503)
    }

    const providedSecret = c.req.header("X-Admin-Secret")
    if (!providedSecret || !timingSafeEqualString(providedSecret, expectedSecret)) {
        return c.json({ message: "Unauthorized" }, 401)
    }

    // Optional defense-in-depth: also verify Cloudflare Access JWT if configured
    const teamDomain = c.env.CF_ACCESS_TEAM_DOMAIN
    const expectedAud = c.env.CF_ACCESS_AUD
    if (teamDomain && expectedAud) {
        const accessJwt = c.req.header("Cf-Access-Jwt-Assertion")
        if (!accessJwt) {
            return c.json({ message: "Unauthorized" }, 401)
        }

        const isValid = await verifyAccessJwt(accessJwt, teamDomain, expectedAud)
        if (!isValid) {
            return c.json({ message: "Unauthorized" }, 401)
        }
    }

    return await next()
})
