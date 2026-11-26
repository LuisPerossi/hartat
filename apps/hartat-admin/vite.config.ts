import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

interface WranglerVars {
  API_URL?: string
  PUBLIC_API_URL?: string
}

// Strips // and /* */ comments from JSONC without corrupting URLs inside strings
function stripJsoncComments(content: string): string {
  let result = ''
  let inString = false
  let escaped = false

  for (let i = 0; i < content.length; i++) {
    const ch = content[i]
    const next = content[i + 1]

    if (inString) {
      result += ch
      if (escaped) {
        escaped = false
      } else if (ch === '\\') {
        escaped = true
      } else if (ch === '"') {
        inString = false
      }
      continue
    }

    if (ch === '"') {
      inString = true
      result += ch
      continue
    }

    if (ch === '/' && next === '/') {
      while (i < content.length && content[i] !== '\n') i++
      result += '\n'
      continue
    }

    if (ch === '/' && next === '*') {
      i += 2
      while (i < content.length && !(content[i] === '*' && content[i + 1] === '/')) i++
      i++
      continue
    }

    result += ch
  }

  return result
}

function readWranglerVars(): WranglerVars {
  const wranglerPath = path.resolve(import.meta.dirname, './wrangler.jsonc')
  const raw = fs.readFileSync(wranglerPath, 'utf-8')
  const parsed = JSON.parse(stripJsoncComments(raw)) as { vars?: WranglerVars }
  return parsed.vars ?? {}
}

const wranglerVars = readWranglerVars()
const apiUrl = (process.env.API_URL ?? wranglerVars.API_URL ?? '/api').replace(/\/+$/, '')
const publicApiUrl = (process.env.PUBLIC_API_URL ?? wranglerVars.PUBLIC_API_URL ?? 'http://127.0.0.1:8787').replace(/\/+$/, '')

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  define: {
    __API_URL__: JSON.stringify(apiUrl),
    __PUBLIC_API_URL__: JSON.stringify(publicApiUrl),
  },
  server: {
    proxy: {
      '/api': {
        target: publicApiUrl,
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api(?=\/|$)/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src')
    }
  }
})
