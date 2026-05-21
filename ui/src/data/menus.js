/** @typedef {{ id: string; label: string; extraPrice: number }} MenuOption */
/** @typedef {{ id: string; name: string; basePrice: number; description: string; options: MenuOption[] }} MenuItem */

/** @type {MenuItem[]} */
export const MENUS = [
  {
    id: 'americano-ice',
    name: '아메리카노(ICE)',
    basePrice: 4000,
    description: '시원하고 깔끔한 아이스 아메리카노',
    options: [
      { id: 'extra-shot', label: '샷 추가', extraPrice: 500 },
      { id: 'extra-syrup', label: '시럽 추가', extraPrice: 0 },
    ],
  },
  {
    id: 'americano-hot',
    name: '아메리카노(HOT)',
    basePrice: 4000,
    description: '고소한 원두 향의 핫 아메리카노',
    options: [
      { id: 'extra-shot', label: '샷 추가', extraPrice: 500 },
      { id: 'extra-syrup', label: '시럽 추가', extraPrice: 0 },
    ],
  },
  {
    id: 'cafe-latte',
    name: '카페라떼',
    basePrice: 5000,
    description: '부드러운 우유와 에스프레소의 조화',
    options: [
      { id: 'extra-shot', label: '샷 추가', extraPrice: 500 },
      { id: 'extra-syrup', label: '시럽 추가', extraPrice: 0 },
    ],
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
