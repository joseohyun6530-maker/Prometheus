import { MENUS } from './menus.js'

/** 관리자 재고 현황에 표시할 메뉴 (와이어프레임 3종) */
export const INVENTORY_MENUS = MENUS.filter((m) =>
  ['americano-ice', 'americano-hot', 'cafe-latte'].includes(m.id),
)

/** @type {Record<string, number>} */
export const INITIAL_INVENTORY = {
  'americano-ice': 10,
  'americano-hot': 10,
  'cafe-latte': 10,
}
