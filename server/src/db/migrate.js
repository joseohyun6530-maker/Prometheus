import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'
import { config } from '../config.js'
import { SEED_MENUS } from './seedData.js'
import { closePool, getPool, query } from './pool.js'

const { Client } = pg
const __dirname = path.dirname(fileURLToPath(import.meta.url))

function parseDbName(connectionString) {
  const url = new URL(connectionString)
  const name = url.pathname.replace(/^\//, '')
  if (!name) throw new Error('DATABASE_URL must include database name (e.g. /cozy)')
  return { url, name }
}

async function ensureDatabase() {
  const { url, name } = parseDbName(config.databaseUrl)
  const adminUrl = new URL(url.toString())
  adminUrl.pathname = '/postgres'

  const client = new Client({ connectionString: adminUrl.toString() })
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

async function runSeed() {
  for (const menu of SEED_MENUS) {
    await query(
      `INSERT INTO menus (id, name, description, price, stock_quantity)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         price = EXCLUDED.price,
         updated_at = NOW()`,
      [menu.id, menu.name, menu.description, menu.price, menu.stock_quantity],
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
  console.log('Connecting to PostgreSQL...')
  await ensureDatabase()
  getPool()
  await runSchema()
  await runSeed()
  await closePool()
  console.log('Database setup complete.')
}

main().catch((err) => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
