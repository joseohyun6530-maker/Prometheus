import { query } from '../db/pool.js'

export async function listMenus() {
  const menusResult = await query(
    `SELECT id, name, description, price, image_url, stock_quantity
     FROM menus
     ORDER BY name`,
  )

  const optionsResult = await query(
    `SELECT id, menu_id, name, price
     FROM options
     ORDER BY menu_id, name`,
  )

  /** @type {Record<string, Array<{ id: string; name: string; price: number }>>} */
  const optionsByMenu = {}
  for (const row of optionsResult.rows) {
    if (!optionsByMenu[row.menu_id]) optionsByMenu[row.menu_id] = []
    optionsByMenu[row.menu_id].push({
      id: row.id,
      name: row.name,
      price: row.price,
    })
  }

  return menusResult.rows.map((menu) => ({
    id: menu.id,
    name: menu.name,
    description: menu.description,
    price: menu.price,
    image_url: menu.image_url,
    stock_quantity: menu.stock_quantity,
    available: menu.stock_quantity > 0,
    options: optionsByMenu[menu.id] ?? [],
  }))
}

export async function getMenuById(menuId, db = query) {
  const menuResult = await db(
    `SELECT id, name, description, price, image_url, stock_quantity
     FROM menus WHERE id = $1`,
    [menuId],
  )
  if (menuResult.rowCount === 0) return null

  const optionsResult = await db(
    `SELECT id, name, price FROM options WHERE menu_id = $1`,
    [menuId],
  )

  const menu = menuResult.rows[0]
  return {
    ...menu,
    options: optionsResult.rows,
  }
}
