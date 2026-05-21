import { Router } from 'express'
import { listInventory, updateInventory } from '../services/inventoryService.js'
import { listAdminOrders, updateOrderStatus } from '../services/orderService.js'

export const adminRouter = Router()

adminRouter.get('/admin/orders', async (req, res, next) => {
  try {
    const activeOnly = req.query.status !== 'all'
    const data = await listAdminOrders(activeOnly)
    res.json(data)
  } catch (err) {
    next(err)
  }
})

adminRouter.patch('/admin/orders/:orderId/status', async (req, res, next) => {
  try {
    const { status } = req.body ?? {}
    if (!status) {
      return res.status(400).json({
        error: { code: 'INVALID_REQUEST', message: 'status가 필요합니다.' },
      })
    }
    const order = await updateOrderStatus(req.params.orderId, status)
    res.json({ order })
  } catch (err) {
    next(err)
  }
})

adminRouter.get('/admin/inventory', async (_req, res, next) => {
  try {
    const items = await listInventory()
    res.json({ items })
  } catch (err) {
    next(err)
  }
})

adminRouter.patch('/admin/inventory/:menuId', async (req, res, next) => {
  try {
    const item = await updateInventory(req.params.menuId, req.body ?? {})
    res.json({ item })
  } catch (err) {
    next(err)
  }
})
