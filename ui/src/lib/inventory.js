/**
 * @param {number} quantity
 * @returns {'정상' | '주의' | '품절'}
 */
export function getStockStatus(quantity) {
  if (quantity <= 0) return '품절'
  if (quantity < 5) return '주의'
  return '정상'
}

/**
 * @param {'정상' | '주의' | '품절'} status
 */
export function getStockStatusClass(status) {
  if (status === '품절') return 'stock-badge--soldout'
  if (status === '주의') return 'stock-badge--warning'
  return 'stock-badge--normal'
}

/**
 * @param {Record<string, number>} inventory
 * @param {string} menuId
 * @param {number} delta
 * @returns {Record<string, number>}
 */
export function adjustInventory(inventory, menuId, delta) {
  const current = inventory[menuId] ?? 0
  const next = Math.max(0, current + delta)
  return { ...inventory, [menuId]: next }
}
