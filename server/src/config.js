import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../.env')

// .env는 로컬 기본값용 — 이미 설정된 환경 변수(배포 대시보드)는 덮어쓰지 않음
dotenv.config({ path: envPath, override: false })

const isProduction = process.env.NODE_ENV === 'production'

/**
 * @param {string | undefined} raw
 * @returns {string[]}
 */
function parseCorsOrigins(raw) {
  if (!raw || !raw.trim()) {
    return ['http://localhost:5173']
  }
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

const port = Number(process.env.PORT) || 3000
const corsOrigins = parseCorsOrigins(process.env.CORS_ORIGIN)
const databaseUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/cozy'

if (isProduction && !process.env.DATABASE_URL) {
  console.error(
    'DATABASE_URL is required in production. Set it in your deployment environment variables.',
  )
  process.exit(1)
}

export const config = {
  port,
  nodeEnv: process.env.NODE_ENV || 'development',
  /** @type {string[]} */
  corsOrigins,
  apiPrefix: '/api/v1',
  databaseUrl,
}
