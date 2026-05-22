import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import { apiRouter } from './routes/index.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          callback(null, true)
          return
        }
        callback(null, config.corsOrigins.includes(origin))
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
