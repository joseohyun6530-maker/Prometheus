import { Router } from 'express'
import { testConnection } from '../db/pool.js'

export const healthRouter = Router()

healthRouter.get('/health', async (_req, res) => {
  try {
    const db = await testConnection()
    res.json({
      status: 'ok',
      service: 'cozy-server',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        name: db.database,
        serverTime: db.now,
      },
    })
  } catch (err) {
    res.status(503).json({
      status: 'degraded',
      service: 'cozy-server',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: err instanceof Error ? err.message : 'Database connection failed',
      },
    })
  }
})
