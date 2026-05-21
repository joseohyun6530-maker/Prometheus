import { createApp } from './app.js'
import { config } from './config.js'
import { closePool, testConnection } from './db/pool.js'

const app = createApp()

async function start() {
  try {
    const db = await testConnection()
    console.log(`PostgreSQL connected: ${db.database}`)
  } catch (err) {
    console.error('PostgreSQL connection failed:', err instanceof Error ? err.message : err)
    console.error('  Check DATABASE_URL in server/.env and run: npm run db:migrate')
    process.exit(1)
  }

  const server = app.listen(config.port, () => {
    console.log(`COZY API server running at http://localhost:${config.port}`)
    console.log(`  Health: http://localhost:${config.port}${config.apiPrefix}/health`)
    console.log(`  CORS origin: ${config.corsOrigin}`)
  })

  const shutdown = async () => {
    server.close()
    await closePool()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

start()
