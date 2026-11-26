export const API_URL: string = __API_URL__
export const PUBLIC_API_URL: string = __PUBLIC_API_URL__

if (!API_URL) { throw new Error('API_URL variable not configured in wrangler.jsonc') }
if (!PUBLIC_API_URL) { throw new Error('PUBLIC_API_URL variable not configured in wrangler.jsonc') }
