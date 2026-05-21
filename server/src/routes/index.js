import { Router } from 'express'
import { healthRouter } from './health.js'

export const apiRouter = Router()

apiRouter.use(healthRouter)

// TODO: menus, orders, admin routes (docs/PRD.md Part 2)
