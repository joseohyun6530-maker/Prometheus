/** @typedef {{ id: string; label: string; extraPrice: number }} MenuOption */
/** @typedef {{ id: string; name: string; basePrice: number; description: string; imageUrl?: string | null; options: MenuOption[] }} MenuItem */

/** 주문하기 화면(와이어프레임)에 표시할 메뉴 ID */
export const ORDER_SCREEN_MENU_IDS = ['americano-ice', 'americano-hot', 'cafe-latte']

const DEFAULT_OPTIONS = [
  { id: 'extra-shot', label: '샷 추가', extraPrice: 500 },
  { id: 'extra-syrup', label: '시럽 추가', extraPrice: 0 },
]

/** @type {MenuItem[]} */
export const MENUS = [
  {
    id: 'americano-ice',
    name: '아메리카노(ICE)',
    basePrice: 4000,
    description: '간단한 설명...',
    imageUrl: '/americano-ice.png',
    options: DEFAULT_OPTIONS,
  },
  {
    id: 'americano-hot',
    name: '아메리카노(HOT)',
    basePrice: 4000,
    description: '간단한 설명...',
    imageUrl: '/americano-hot.png',
    options: DEFAULT_OPTIONS,
  },
  {
    id: 'cafe-latte',
    name: '카페라떼',
    basePrice: 5000,
    description: '간단한 설명...',
    imageUrl: '/caffe-latte.png',
    options: DEFAULT_OPTIONS,
  },
  {
    id: 'vanilla-latte',
    name: '바닐라라떼',
    basePrice: 5500,
    description: '달콤한 바닐라 시럽이 들어간 라떼',
    options: [
      { id: 'extra-shot', label: '샷 추가', extraPrice: 500 },
      { id: 'extra-syrup', label: '시럽 추가', extraPrice: 0 },
    ],
  },
  {
    id: 'caramel-macchiato',
    name: '카라멜 마키아토',
    basePrice: 6000,
    description: '카라멜 드리즐과 에스프레소의 레이어드',
    options: [
      { id: 'extra-shot', label: '샷 추가', extraPrice: 500 },
      { id: 'extra-syrup', label: '시럽 추가', extraPrice: 0 },
    ],
  },
  {
    id: 'cold-brew',
    name: '콜드브루',
    basePrice: 4500,
    description: '12시간 저온 추출한 진한 콜드브루',
    options: [
      { id: 'extra-shot', label: '샷 추가', extraPrice: 500 },
      { id: 'extra-syrup', label: '시럽 추가', extraPrice: 0 },
    ],
  },
]

/** @param {MenuItem[]} menus */
export function getOrderScreenMenus(menus) {
  const byId = new Map(menus.map((m) => [m.id, m]))
  const fromApi = ORDER_SCREEN_MENU_IDS.map((id) => byId.get(id)).filter(Boolean)
  if (fromApi.length > 0) return fromApi
  return MENUS.filter((m) => ORDER_SCREEN_MENU_IDS.includes(m.id))
}

/** API 실패 시 사용할 기본 재고 */
export const DEFAULT_ORDER_INVENTORY = {
  'americano-ice': 10,
  'americano-hot': 10,
  'cafe-latte': 10,
}
