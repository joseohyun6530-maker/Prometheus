import { getPool } from '../db/pool.js'
import { ORDER_STATUS_LABEL, ORDER_STATUS_TRANSITIONS } from '../constants.js'
import { ApiError } from '../errors/ApiError.js'
import { createLineId, createOptionLineId, createOrderId } from '../utils/ids.js'
import { getMenuById } from './menuService.js'

/**
 * @param {import('pg').QueryResultRow} orderRow
 * @param {import('pg').QueryResultRow[]} itemRows
 * @param {import('pg').QueryResultRow[]} optionRows
 */
function formatOrder(orderRow, itemRows, optionRows) {
  const optionsByItem = {}
  for (const opt of optionRows) {
    if (!optionsByItem[opt.order_item_id]) optionsByItem[opt.order_item_id] = []
    optionsByItem[opt.order_item_id].push({
      option_id: opt.option_id,
      option_name: opt.option_name,
      option_price: opt.option_price,
    })
  }

  const items = itemRows.map((item) => {
    const optionIds = (optionsByItem[item.id] ?? []).map((o) => o.option_id).sort()
    return {
      key: `${item.menu_id}:${optionIds.join(',')}`,
      menu_id: item.menu_id,
      menu_name: item.menu_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.line_total,
      selectedOptionIds: optionIds,
      selectedOptions: (optionsByItem[item.id] ?? []).map((o) => ({
        id: o.option_id,
        label: o.option_name,
        extraPrice: o.option_price,
      })),
      options: optionsByItem[item.id] ?? [],
    }
  })

  return {
    id: orderRow.id,
    ordered_at: orderRow.ordered_at,
    orderedAt: orderRow.ordered_at,
    status: orderRow.status,
    status_label: ORDER_STATUS_LABEL[orderRow.status],
    total_amount: orderRow.total_amount,
    totalAmount: orderRow.total_amount,
    lines: items,
    items,
  }
}

async function fetchOrderRows(orderId, client) {
  const orderResult = await client.query(`SELECT * FROM orders WHERE id = $1`, [orderId])
  if (orderResult.rowCount === 0) return null

  const itemsResult = await client.query(
    `SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at`,
    [orderId],
  )
  const itemIds = itemsResult.rows.map((r) => r.id)
  let optionRows = []
  if (itemIds.length > 0) {
    const optionsResult = await client.query(
      `SELECT * FROM order_item_options WHERE order_item_id = ANY($1::varchar[])`,
      [itemIds],
    )
    optionRows = optionsResult.rows
  }

  return formatOrder(orderResult.rows[0], itemsResult.rows, optionRows)
}

export async function getOrderById(orderId) {
  const pool = getPool()
  const client = await pool.connect()
  try {
    const order = await fetchOrderRows(orderId, client)
    return order
  } finally {
    client.release()
  }
}

/**
 * @param {{ menu_id: string; quantity: number; option_ids?: string[] }[]} items
 */
export async function createOrder(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'INVALID_REQUEST', '주문 항목이 필요합니다.')
  }

  const pool = getPool()
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const orderId = createOrderId()
    const orderedAt = new Date()
    let totalAmount = 0
    /** @type {Array<{ menuId: string; qty: number }>} */
    const stockNeeds = []

    const preparedLines = []

    for (const item of items) {
      const menuId = item.menu_id
      const quantity = Number(item.quantity)
      const optionIds = [...(item.option_ids ?? [])].sort()

      if (!menuId || !Number.isInteger(quantity) || quantity < 1) {
        throw new ApiError(400, 'INVALID_REQUEST', '유효하지 않은 주문 항목입니다.')
      }

      const menu = await getMenuById(menuId, (text, params) => client.query(text, params))
      if (!menu) {
        throw new ApiError(404, 'MENU_NOT_FOUND', `메뉴를 찾을 수 없습니다: ${menuId}`)
      }

      const optionMap = new Map(menu.options.map((o) => [o.id, o]))
      let optionExtra = 0
      const selectedOptions = []

      for (const optId of optionIds) {
        const opt = optionMap.get(optId)
        if (!opt) {
          throw new ApiError(404, 'MENU_NOT_FOUND', `옵션을 찾을 수 없습니다: ${optId}`)
        }
        optionExtra += opt.price
        selectedOptions.push(opt)
      }

      const unitPrice = menu.price + optionExtra
      const lineTotal = unitPrice * quantity
      totalAmount += lineTotal

      stockNeeds.push({ menuId, qty: quantity })
      preparedLines.push({
        menu,
        quantity,
        optionIds,
        selectedOptions,
        unitPrice,
        lineTotal,
      })
    }

    const stockByMenu = {}
    for (const { menuId, qty } of stockNeeds) {
      stockByMenu[menuId] = (stockByMenu[menuId] ?? 0) + qty
    }

    for (const [menuId, needed] of Object.entries(stockByMenu)) {
      const lock = await client.query(
        `SELECT stock_quantity, name FROM menus WHERE id = $1 FOR UPDATE`,
        [menuId],
      )
      if (lock.rowCount === 0) {
        throw new ApiError(404, 'MENU_NOT_FOUND', `메뉴를 찾을 수 없습니다: ${menuId}`)
      }
      const stock = lock.rows[0].stock_quantity
      if (needed > stock) {
        throw new ApiError(
          409,
          'INSUFFICIENT_STOCK',
          `${lock.rows[0].name} 재고가 부족합니다. (주문 ${needed}개, 재고 ${stock}개)`,
        )
      }
    }

    await client.query(
      `INSERT INTO orders (id, ordered_at, status, total_amount)
       VALUES ($1, $2, 'RECEIVED', $3)`,
      [orderId, orderedAt, totalAmount],
    )

    for (const line of preparedLines) {
      const lineId = createLineId()
      await client.query(
        `INSERT INTO order_items (id, order_id, menu_id, menu_name, quantity, unit_price, line_total)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          lineId,
          orderId,
          line.menu.id,
          line.menu.name,
          line.quantity,
          line.unitPrice,
          line.lineTotal,
        ],
      )

      for (const opt of line.selectedOptions) {
        await client.query(
          `INSERT INTO order_item_options (id, order_item_id, option_id, option_name, option_price)
           VALUES ($1, $2, $3, $4, $5)`,
          [createOptionLineId(), lineId, opt.id, opt.name, opt.price],
        )
      }
    }

    for (const [menuId, needed] of Object.entries(stockByMenu)) {
      await client.query(
        `UPDATE menus SET stock_quantity = stock_quantity - $1, updated_at = NOW() WHERE id = $2`,
        [needed, menuId],
      )
    }

    await client.query('COMMIT')
    return await fetchOrderRows(orderId, client)
  } catch (err) {
    try {
      await client.query('ROLLBACK')
    } catch {
      // 트랜잭션이 없을 때 ROLLBACK 실패는 무시
    }
    throw err
  } finally {
    client.release()
  }
}

export async function listAdminOrders(activeOnly = true) {
  const pool = getPool()

  const dashboardResult = await pool.query(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE status = 'RECEIVED')::int AS received,
       COUNT(*) FILTER (WHERE status = 'IN_PREPARATION')::int AS in_preparation,
       COUNT(*) FILTER (WHERE status = 'COMPLETED')::int AS completed
     FROM orders`,
  )

  const whereClause = activeOnly ? `WHERE status != 'COMPLETED'` : ''
  const ordersResult = await pool.query(
    `SELECT id FROM orders ${whereClause} ORDER BY ordered_at DESC`,
  )

  const orders = []
  const client = await pool.connect()
  try {
    for (const row of ordersResult.rows) {
      const order = await fetchOrderRows(row.id, client)
      if (order) orders.push(order)
    }
  } finally {
    client.release()
  }

  const d = dashboardResult.rows[0]
  return {
    orders,
    dashboard: {
      total: d.total,
      received: d.received,
      in_preparation: d.in_preparation,
      completed: d.completed,
    },
  }
}

export async function updateOrderStatus(orderId, nextStatus) {
  const pool = getPool()
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const current = await client.query(`SELECT status FROM orders WHERE id = $1 FOR UPDATE`, [
      orderId,
    ])
    if (current.rowCount === 0) {
      throw new ApiError(404, 'ORDER_NOT_FOUND', '주문을 찾을 수 없습니다.')
    }

    const currentStatus = current.rows[0].status
    const allowed = ORDER_STATUS_TRANSITIONS[currentStatus]
    if (allowed !== nextStatus) {
      throw new ApiError(
        400,
        'INVALID_REQUEST',
        `${ORDER_STATUS_LABEL[currentStatus]} 상태에서는 ${ORDER_STATUS_LABEL[nextStatus]}(으)로 변경할 수 없습니다.`,
      )
    }

    await client.query(`UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`, [
      nextStatus,
      orderId,
    ])
    await client.query('COMMIT')

    return await fetchOrderRows(orderId, client)
  } catch (err) {
    try {
      await client.query('ROLLBACK')
    } catch {
      // 트랜잭션이 없을 때 ROLLBACK 실패는 무시
    }
    throw err
  } finally {
    client.release()
  }
}
