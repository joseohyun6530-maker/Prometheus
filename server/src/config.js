import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../.env')

const isRender = process.env.RENDER === 'true'
const isProduction = process.env.NODE_ENV === 'production'
const isDeployed = isRender || isProduction

// Render: .env 파일을 읽지 않음 (저장소에 없어도, localhost 기본값이 섞이지 않게)
if (!isRender) {
  dotenv.config({ path: envPath, override: false })
}

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

/**
 * @param {string | undefined} raw
 */
function normalizeDatabaseUrl(raw) {
  if (!raw) return undefined
  const trimmed = raw.trim()
  if (trimmed.startsWith('postgres://')) {
    return `postgresql://${trimmed.slice('postgres://'.length)}`
  }
  return trimmed
}

/**
 * @param {string} connectionString
 */
function isLocalDatabaseHost(connectionString) {
  try {
    const host = new URL(connectionString).hostname
    return host === 'localhost' || host === '127.0.0.1'
  } catch {
    return false
  }
}

const port = Number(process.env.PORT) || 3000
const corsOrigins = parseCorsOrigins(process.env.CORS_ORIGIN)

/**
 * @returns {string | undefined}
 */
function resolveDatabaseUrl() {
  const candidates = [
    process.env.INTERNAL_DATABASE_URL,
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRESQL_URL,
  ]

  const migrateDuringBuild =
    isRender && process.env.npm_lifecycle_event === 'db:migrate'
  const order = migrateDuringBuild
    ? [process.env.DATABASE_URL, process.env.INTERNAL_DATABASE_URL, process.env.POSTGRES_URL, process.env.POSTGRESQL_URL]
    : candidates

  for (const raw of order) {
    const url = normalizeDatabaseUrl(raw)
    if (!url) continue
    if (isRender && isLocalDatabaseHost(url)) continue
    return url
  }

  return undefined
}

const rawDatabaseUrl = resolveDatabaseUrl()
const LOCAL_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/cozy'

function failDatabaseConfig(message) {
  console.error(message)
  console.error('  Render: PostgreSQL 인스턴스 → cozy-server → Connections → Link Resource')
  console.error('  또는 Environment에 External Database URL을 DATABASE_URL 로 추가')
  process.exit(1)
}

if (isDeployed && !rawDatabaseUrl) {
  failDatabaseConfig(
    'DATABASE_URL is required when deployed (Render/production). localhost/.env defaults are not used.',
  )
}

const databaseUrl = rawDatabaseUrl || LOCAL_DATABASE_URL

if (isDeployed) {
  try {
    const u = new URL(databaseUrl)
    console.log(`Database host: ${u.hostname} (SSL auto for non-local)`)
    if (isRender && isLocalDatabaseHost(databaseUrl)) {
      failDatabaseConfig('DATABASE_URL must not point to localhost on Render. Link PostgreSQL or use External URL.')
    }
  } catch {
    failDatabaseConfig('DATABASE_URL is not a valid URL. URL-encode special characters in the password.')
  }
}

export const config = {
  port,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDeployed,
  /** @type {string[]} */
  corsOrigins,
  apiPrefix: '/api/v1',
  databaseUrl,
}
