import { calcCartTotal, formatOptionSuffix } from './cart.js'

/** @typedef {'RECEIVED' | 'IN_PREPARATION' | 'COMPLETED'} OrderStatus */

/**
 * @typedef {object} Order
 * @property {string} id
 * @property {string} orderedAt
 * @property {OrderStatus} status
 * @property {import('./cart.js').CartLine[]} lines
 * @property {number} totalAmount
 */

/**
 * @param {import('./cart.js').CartLine[]} cart
 * @returns {Order}
 */
export function createOrderFromCart(cart) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    orderedAt: new Date().toISOString(),
    status: 'RECEIVED',
    lines: cart.map((line) => ({ ...line })),
    totalAmount: calcCartTotal(cart),
  }
}

/**
 * @param {string} iso
 */
export function formatOrderDateTime(iso) {
  const d = new Date(iso)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hours = d.getHours()
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${month}월 ${day}일 ${hours}:${minutes}`
}

/**
 * @param {import('./cart.js').CartLine} line
 */
export function formatOrderLineLabel(line) {
  return `${line.name}${formatOptionSuffix(line.selectedOptions)} x ${line.quantity}`
}

/**
 * @param {Order[]} orders
 */
export function calcDashboardStats(orders) {
  return {
    total: orders.length,
    received: orders.filter((o) => o.status === 'RECEIVED').length,
    inPreparation: orders.filter((o) => o.status === 'IN_PREPARATION').length,
    completed: orders.filter((o) => o.status === 'COMPLETED').length,
  }
}

/** @type {Record<OrderStatus, string>} */
export const ORDER_STATUS_LABEL = {
  RECEIVED: '주문 접수',
  IN_PREPARATION: '제조 중',
  COMPLETED: '제조 완료',
}

/**
 * @param {Order[]} orders
 * @param {string} orderId
 * @returns {Order[]}
 */
export function startOrderPreparation(orders, orderId) {
  return orders.map((order) =>
    order.id === orderId && order.status === 'RECEIVED'
      ? { ...order, status: 'IN_PREPARATION' }
      : order,
  )
}

/**
 * @param {Order[]} orders
 */
export function getActiveOrders(orders) {
  return orders
    .filter((o) => o.status !== 'COMPLETED')
    .sort((a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime())
}
