/**
 * Managed PostgreSQL(Render, Neon 등)는 SSL이 필요합니다.
 * @param {string} connectionString
 * @returns {import('pg').ConnectionConfig['ssl'] | undefined}
 */
export function resolvePgSsl(connectionString) {
  if (process.env.DATABASE_SSL === 'false') {
    return undefined
  }
  if (process.env.DATABASE_SSL === 'true') {
    return { rejectUnauthorized: false }
  }

  try {
    const url = new URL(connectionString)
    const host = url.hostname
    const isLocal = host === 'localhost' || host === '127.0.0.1'
    if (isLocal) {
      return undefined
    }

    const sslmode = url.searchParams.get('sslmode')
    if (sslmode === 'disable') {
      return undefined
    }

    return { rejectUnauthorized: false }
  } catch {
    return undefined
  }
}

/**
 * @param {string} connectionString
 */
export function isManagedPostgres(connectionString) {
  if (process.env.DATABASE_MANAGED === 'true') {
    return true
  }
  return /render\.com|railway\.app|neon\.tech|supabase\.co|amazonaws\.com|elephantsql\.com/i.test(
    connectionString,
  )
}
