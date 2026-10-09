export const API_URL: string = import.meta.env.VITE_API_URL
if (!API_URL) { throw new Error('API_URL variable not configured') }