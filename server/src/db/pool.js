import pg from 'pg'
import { config } from '../config.js'
import { resolvePgSsl } from './ssl.js'

const { Pool } = pg

/** @type {pg.Pool | null} */
let pool = null

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: resolvePgSsl(config.databaseUrl),
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 30_000,
    })

    pool.on('error', (err) => {
      console.error('Unexpected PostgreSQL pool error', err)
    })
  }

  return pool
}

export async function query(text, params) {
  return getPool().query(text, params)
}

export async function testConnection() {
  const result = await query('SELECT NOW() AS now, current_database() AS database')
  return {
    ok: true,
    now: result.rows[0].now,
    database: result.rows[0].database,
  }
}

export async function closePool() {
  if (pool) {
    await pool.end()
    pool = null
  }
}
