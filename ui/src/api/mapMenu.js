/**
 * @param {import('./types.js').ApiMenu} apiMenu
 * @returns {import('../data/menus.js').MenuItem}
 */
export function mapApiMenuToMenuItem(apiMenu) {
  return {
    id: apiMenu.id,
    name: apiMenu.name,
    basePrice: apiMenu.price,
    description: apiMenu.description,
    imageUrl: apiMenu.image_url,
    options: apiMenu.options.map((opt) => ({
      id: opt.id,
      label: opt.name,
      extraPrice: opt.price,
    })),
  }
}

/**
 * @param {import('./types.js').ApiMenu[]} apiMenus
 * @returns {Record<string, number>}
 */
export function buildInventoryFromMenus(apiMenus) {
  /** @type {Record<string, number>} */
  const inventory = {}
  for (const menu of apiMenus) {
    inventory[menu.id] = menu.stock_quantity
  }
  return inventory
}
