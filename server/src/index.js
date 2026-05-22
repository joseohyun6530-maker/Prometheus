import { createApp } from './app.js'
import { config } from './config.js'
import { closePool, testConnection } from './db/pool.js'

const app = createApp()

const DB_RETRY_ATTEMPTS = 5
const DB_RETRY_DELAY_MS = 3000

async function connectDatabase() {
  let lastError
  for (let attempt = 1; attempt <= DB_RETRY_ATTEMPTS; attempt++) {
    try {
      const db = await testConnection()
      console.log(`PostgreSQL connected: ${db.database}`)
      return
    } catch (err) {
      lastError = err
      const message = err instanceof Error ? err.message : String(err)
      console.error(`PostgreSQL attempt ${attempt}/${DB_RETRY_ATTEMPTS} failed: ${message}`)
      if (attempt < DB_RETRY_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, DB_RETRY_DELAY_MS))
      }
    }
  }
  console.error('  - Set DATABASE_URL (Render PostgreSQL Internal URL recommended)')
  console.error('  - Link PostgreSQL to this Web Service, or paste URL in Environment')
  console.error('  - Password special chars must be URL-encoded in DATABASE_URL')
  throw lastError
}

async function start() {
  const server = app.listen(config.port, '0.0.0.0', () => {
    console.log(`COZY API server running on port ${config.port} (${config.nodeEnv})`)
    console.log(`  Health: ${config.apiPrefix}/health`)
    console.log(`  CORS origins: ${config.corsOrigins.join(', ')}`)
  })

  await connectDatabase()

  const shutdown = async () => {
    server.close()
    await closePool()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

start().catch((err) => {
  console.error('Server failed to start:', err instanceof Error ? err.message : err)
  process.exit(1)
})
