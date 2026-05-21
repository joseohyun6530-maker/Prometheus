import { apiFetch } from './client.js'

export function fetchAdminOrders() {
  return apiFetch('/admin/orders?status=active')
}

/**
 * @param {string} orderId
 * @param {'IN_PREPARATION' | 'COMPLETED'} status
 */
export function patchOrderStatus(orderId, status) {
  return apiFetch(`/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function fetchInventory() {
  return apiFetch('/admin/inventory')
}

/**
 * @param {string} menuId
 * @param {number} delta
 */
export function patchInventory(menuId, delta) {
  return apiFetch(`/admin/inventory/${menuId}`, {
    method: 'PATCH',
    body: JSON.stringify({ delta }),
  })
}
