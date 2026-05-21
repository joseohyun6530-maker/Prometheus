import { apiFetch } from './client.js'

/**
 * @param {{ menu_id: string; quantity: number; option_ids: string[] }[]} items
 */
export function createOrder(items) {
  return apiFetch('/orders', {
    method: 'POST',
    body: JSON.stringify({ items }),
  })
}

/**
 * @param {string} orderId
 */
export function fetchOrder(orderId) {
  return apiFetch(`/orders/${orderId}`)
}
