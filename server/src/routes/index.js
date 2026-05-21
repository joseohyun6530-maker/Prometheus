import { Router } from 'express'
import { healthRouter } from './health.js'
import { menusRouter } from './menus.js'
import { ordersRouter } from './orders.js'
import { adminRouter } from './admin.js'

export const apiRouter = Router()

apiRouter.use(healthRouter)
apiRouter.use(menusRouter)
apiRouter.use(ordersRouter)
apiRouter.use(adminRouter)
