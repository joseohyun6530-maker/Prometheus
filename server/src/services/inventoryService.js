import { INVENTORY_MENU_IDS } from '../constants.js'
import { query } from '../db/pool.js'
import { ApiError } from '../errors/ApiError.js'
import { getStockStatus } from '../utils/stock.js'

export async function listInventory() {
  const result = await query(
    `SELECT id, name, stock_quantity
     FROM menus
     WHERE id = ANY($1::varchar[])
     ORDER BY name`,
    [INVENTORY_MENU_IDS],
  )

  return result.rows.map((row) => ({
    menu_id: row.id,
    name: row.name,
    stock_quantity: Number(row.stock_quantity),
    stock_status: getStockStatus(Number(row.stock_quantity)),
  }))
}

/**
 * @param {string} menuId
 * @param {{ delta?: number; stock_quantity?: number }} payload
 */
export async function updateInventory(menuId, payload) {
  if (!INVENTORY_MENU_IDS.includes(menuId)) {
    throw new ApiError(404, 'MENU_NOT_FOUND', '재고 관리 대상 메뉴가 아닙니다.')
  }

  const current = await query(`SELECT stock_quantity, name FROM menus WHERE id = $1`, [menuId])
  if (current.rowCount === 0) {
    throw new ApiError(404, 'MENU_NOT_FOUND', '메뉴를 찾을 수 없습니다.')
  }

  let nextQty
  if (typeof payload.stock_quantity === 'number') {
    nextQty = Math.max(0, Math.floor(payload.stock_quantity))
  } else if (typeof payload.delta === 'number') {
    nextQty = Math.max(0, current.rows[0].stock_quantity + payload.delta)
  } else {
    throw new ApiError(400, 'INVALID_REQUEST', 'delta 또는 stock_quantity가 필요합니다.')
  }

  await query(`UPDATE menus SET stock_quantity = $1, updated_at = NOW() WHERE id = $2`, [
    nextQty,
    menuId,
  ])

  return {
    menu_id: menuId,
    name: current.rows[0].name,
    stock_quantity: nextQty,
    stock_status: getStockStatus(nextQty),
  }
}
