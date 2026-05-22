import { DEFAULT_ORDER_INVENTORY, MENUS } from '../data/menus.js'
import { INVENTORY_MENU_IDS } from '../data/inventoryMenus.js'
import { getStockStatus } from './inventory.js'

export const OFFLINE_NOTICE =
  '서버에 연결할 수 없습니다. 데모 데이터로 화면을 표시합니다. 주문·재고 변경은 서버 연결 후 가능합니다.'

export const OFFLINE_ACTION_MESSAGE =
  '서버에 연결되어 있지 않아 이 작업을 할 수 없습니다.'

/** @returns {{ menus: typeof MENUS; inventory: Record<string, number> }} */
export function getDemoOrderState() {
  return {
    menus: MENUS,
    inventory: { ...DEFAULT_ORDER_INVENTORY },
  }
}

/** @returns {{
 *   orders: []
 *   dashboard: { total: number; received: number; inPreparation: number; completed: number }
 *   inventoryItems: import('../api/types.js').ApiInventoryItem[]
 *   inventory: Record<string, number>
 * }} */
export function getDemoAdminState() {
  const inventory = { ...DEFAULT_ORDER_INVENTORY }
  const inventoryItems = INVENTORY_MENU_IDS.map((menuId) => {
    const menu = MENUS.find((m) => m.id === menuId)
    const stock_quantity = inventory[menuId] ?? 10
    return {
      menu_id: menuId,
      name: menu?.name ?? menuId,
      stock_quantity,
      stock_status: getStockStatus(stock_quantity),
    }
  })

  return {
    orders: [],
    dashboard: { total: 0, received: 0, inPreparation: 0, completed: 0 },
    inventoryItems,
    inventory,
  }
}
