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
    console.error('  - Set DATABASE_URL in the host environment variables')
    console.error('  - Render/Neon DB needs SSL (enabled automatically for non-local hosts)')
    console.error('  - Run once: npm run db:migrate (or add to Render Build Command)')
    process.exit(1)
  }

  const server = app.listen(config.port, '0.0.0.0', () => {
    console.log(`COZY API server running on port ${config.port} (${config.nodeEnv})`)
    console.log(`  Health: http://localhost:${config.port}${config.apiPrefix}/health`)
    console.log(`  CORS origins: ${config.corsOrigins.join(', ')}`)
  })

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
