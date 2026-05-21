import { Router } from 'express'
import { listMenus } from '../services/menuService.js'

export const menusRouter = Router()

menusRouter.get('/menus', async (_req, res, next) => {
  try {
    const menus = await listMenus()
    res.json({ menus })
  } catch (err) {
    next(err)
  }
})
