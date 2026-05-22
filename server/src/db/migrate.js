import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'
import { config } from '../config.js'
import { SEED_MENUS } from './seedData.js'
import { closePool, getPool, query } from './pool.js'
import { isManagedPostgres, resolvePgSsl } from './ssl.js'

const { Client } = pg
const __dirname = path.dirname(fileURLToPath(import.meta.url))

function parseDbName(connectionString) {
  const url = new URL(connectionString)
  const name = url.pathname.replace(/^\//, '')
  if (!name) throw new Error('DATABASE_URL must include database name (e.g. /cozy)')
  return { url, name }
}

async function ensureDatabase() {
  if (isManagedPostgres(config.databaseUrl)) {
    console.log('Managed PostgreSQL: skipping CREATE DATABASE step.')
    return
  }

  const { url, name } = parseDbName(config.databaseUrl)
  const adminUrl = new URL(url.toString())
  adminUrl.pathname = '/postgres'

  const adminConn = adminUrl.toString()
  const client = new Client({
    connectionString: adminConn,
    ssl: resolvePgSsl(adminConn),
  })
  await client.connect()

  const exists = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [name])
  if (exists.rowCount === 0) {
    await client.query(`CREATE DATABASE "${name}"`)
    console.log(`Created database: ${name}`)
  }

  await client.end()
}

async function runSchema() {
  const schemaPath = path.join(__dirname, 'schema.sql')
  const sql = await fs.readFile(schemaPath, 'utf8')
  await query(sql)
  console.log('Schema applied.')
}

/** @type {Record<string, string>} */
const MENU_IMAGE_URLS = {
  'americano-ice': '/americano-ice.png',
  'americano-hot': '/americano-hot.png',
  'cafe-latte': '/caffe-latte.png',
}

async function runSeed() {
  for (const menu of SEED_MENUS) {
    const imageUrl = MENU_IMAGE_URLS[menu.id] ?? null
    await query(
      `INSERT INTO menus (id, name, description, price, stock_quantity, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         price = EXCLUDED.price,
         image_url = COALESCE(EXCLUDED.image_url, menus.image_url),
         updated_at = NOW()`,
      [menu.id, menu.name, menu.description, menu.price, menu.stock_quantity, imageUrl],
    )

    for (const option of menu.options) {
      await query(
        `INSERT INTO options (id, menu_id, name, price)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id, menu_id) DO UPDATE SET
           name = EXCLUDED.name,
           price = EXCLUDED.price,
           updated_at = NOW()`,
        [option.id, menu.id, option.name, option.price],
      )
    }
  }

  console.log(`Seeded ${SEED_MENUS.length} menus.`)
}

async function main() {
  if (config.isDeployed && !config.databaseUrl) {
    throw new Error(
      'DATABASE_URL이 없습니다. Render: PostgreSQL → Connections → Link Resource.',
    )
  }
  console.log('Connecting to PostgreSQL...')
  await ensureDatabase()
  const pool = getPool()
  await pool.query('SELECT 1')
  console.log('PostgreSQL connection OK.')
  await runSchema()
  await runSeed()
  await closePool()
  console.log('Database setup complete.')
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err)
  console.error('Migration failed:', message || err)
  if (err instanceof Error && err.stack) {
    console.error(err.stack)
  }
  if (process.env.RENDER === 'true') {
    console.error(
      'Render: PostgreSQL를 Web Service에 Link하고, Environment의 localhost DATABASE_URL은 삭제하세요.',
    )
    if (process.env.npm_lifecycle_event === 'db:migrate') {
      console.error('Build Command에는 db:migrate를 넣지 말고 `npm install`만 사용하세요.')
    }
  }
  process.exit(1)
})
