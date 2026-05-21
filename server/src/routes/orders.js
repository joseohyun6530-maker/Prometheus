import { Router } from 'express'
import { createOrder, getOrderById } from '../services/orderService.js'

export const ordersRouter = Router()

ordersRouter.post('/orders', async (req, res, next) => {
  try {
    const order = await createOrder(req.body?.items)
    res.status(201).json({ order })
  } catch (err) {
    next(err)
  }
})

ordersRouter.get('/orders/:orderId', async (req, res, next) => {
  try {
    const order = await getOrderById(req.params.orderId)
    if (!order) {
      return res.status(404).json({
        error: { code: 'ORDER_NOT_FOUND', message: '주문을 찾을 수 없습니다.' },
      })
    }
    res.json({ order })
  } catch (err) {
    next(err)
  }
})
