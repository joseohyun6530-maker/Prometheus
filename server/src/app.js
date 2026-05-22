import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import { apiRouter } from './routes/index.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

/**
 * @param {string | undefined} origin
 */
function isAllowedCorsOrigin(origin) {
  if (!origin) return true
  if (config.corsOrigins.includes(origin)) return true
  if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return true
  if (/^https:\/\/[a-z0-9-]+\.onrender\.com$/.test(origin)) return true
  return false
}

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin(origin, callback) {
        callback(null, isAllowedCorsOrigin(origin))
      },
      credentials: true,
    }),
  )
  app.use(express.json())

  app.get('/', (_req, res) => {
    res.json({
      name: 'COZY API',
      version: '0.1.0',
      docs: `${config.apiPrefix}/health`,
    })
  })

  app.use(config.apiPrefix, apiRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
