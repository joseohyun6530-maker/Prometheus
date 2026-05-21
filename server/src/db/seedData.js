/** @type {Array<{ id: string; name: string; description: string; price: number; stock_quantity: number; options: Array<{ id: string; name: string; price: number }> }>} */
export const SEED_MENUS = [
  {
    id: 'americano-ice',
    name: '아메리카노(ICE)',
    description: '시원하고 깔끔한 아이스 아메리카노',
    price: 4000,
    stock_quantity: 10,
    options: [
      { id: 'extra-shot', name: '샷 추가', price: 500 },
      { id: 'extra-syrup', name: '시럽 추가', price: 0 },
    ],
  },
  {
    id: 'americano-hot',
    name: '아메리카노(HOT)',
    description: '고소한 원두 향의 핫 아메리카노',
    price: 4000,
    stock_quantity: 10,
    options: [
      { id: 'extra-shot', name: '샷 추가', price: 500 },
      { id: 'extra-syrup', name: '시럽 추가', price: 0 },
    ],
  },
  {
    id: 'cafe-latte',
    name: '카페라떼',
    description: '부드러운 우유와 에스프레소의 조화',
    price: 5000,
    stock_quantity: 10,
    options: [
      { id: 'extra-shot', name: '샷 추가', price: 500 },
      { id: 'extra-syrup', name: '시럽 추가', price: 0 },
    ],
  },
  {
    id: 'vanilla-latte',
    name: '바닐라라떼',
    description: '달콤한 바닐라 시럽이 들어간 라떼',
    price: 5500,
    stock_quantity: 10,
    options: [
      { id: 'extra-shot', name: '샷 추가', price: 500 },
      { id: 'extra-syrup', name: '시럽 추가', price: 0 },
    ],
  },
  {
    id: 'caramel-macchiato',
    name: '카라멜 마키아토',
    description: '카라멜 드리즐과 에스프레소의 레이어드',
    price: 6000,
    stock_quantity: 10,
    options: [
      { id: 'extra-shot', name: '샷 추가', price: 500 },
      { id: 'extra-syrup', name: '시럽 추가', price: 0 },
    ],
  },
  {
    id: 'cold-brew',
    name: '콜드브루',
    description: '12시간 저온 추출한 진한 콜드브루',
    price: 4500,
    stock_quantity: 10,
    options: [
      { id: 'extra-shot', name: '샷 추가', price: 500 },
      { id: 'extra-syrup', name: '시럽 추가', price: 0 },
    ],
  },
]
