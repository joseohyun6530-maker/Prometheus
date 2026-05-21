import { INITIAL_INVENTORY } from '../data/inventoryMenus.js'

/** @type {Set<string>} */
const TRACKED_MENU_IDS = new Set(Object.keys(INITIAL_INVENTORY))

/**
 * @param {string} menuId
 */
export function isInventoryTracked(menuId) {
  return TRACKED_MENU_IDS.has(menuId)
}

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
 */
export function getMenuStock(inventory, menuId) {
  if (!isInventoryTracked(menuId)) return null
  return inventory[menuId] ?? 0
}

/**
 * @param {import('./cart.js').CartLine[]} cart
 * @param {string} menuId
 */
export function getCartQuantityForMenu(cart, menuId) {
  return cart
    .filter((line) => line.menuId === menuId)
    .reduce((sum, line) => sum + line.quantity, 0)
}

/**
 * @param {Record<string, number>} inventory
 * @param {import('./cart.js').CartLine[]} cart
 * @param {string} menuId
 */
export function canAddMenuToCart(inventory, cart, menuId) {
  const stock = getMenuStock(inventory, menuId)
  if (stock === null) return true
  return getCartQuantityForMenu(cart, menuId) + 1 <= stock
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

/**
 * @param {Record<string, number>} inventory
 * @param {import('./cart.js').CartLine[]} cart
 * @returns {Record<string, number>}
 */
export function deductInventoryForCart(inventory, cart) {
  let next = { ...inventory }
  for (const line of cart) {
    if (isInventoryTracked(line.menuId)) {
      next = adjustInventory(next, line.menuId, -line.quantity)
    }
  }
  return next
}

/**
 * @param {Record<string, number>} inventory
 * @param {import('./cart.js').CartLine[]} cart
 * @returns {{ ok: true } | { ok: false; message: string }}
 */
export function validateCartAgainstInventory(inventory, cart) {
  /** @type {Record<string, number>} */
  const needed = {}

  for (const line of cart) {
    if (!isInventoryTracked(line.menuId)) continue
    needed[line.menuId] = (needed[line.menuId] ?? 0) + line.quantity
  }

  for (const [menuId, qty] of Object.entries(needed)) {
    const stock = inventory[menuId] ?? 0
    if (qty > stock) {
      const name = cart.find((line) => line.menuId === menuId)?.name ?? menuId
      return {
        ok: false,
        message: `${name} 재고가 부족합니다. (주문 ${qty}개, 재고 ${stock}개)`,
      }
    }
  }

  return { ok: true }
}
