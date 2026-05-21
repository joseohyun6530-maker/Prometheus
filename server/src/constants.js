export const ORDER_STATUS_LABEL = {
  RECEIVED: '주문 접수',
  IN_PREPARATION: '제조 중',
  COMPLETED: '제조 완료',
}

/** @type {Record<string, string | null>} */
export const ORDER_STATUS_TRANSITIONS = {
  RECEIVED: 'IN_PREPARATION',
  IN_PREPARATION: 'COMPLETED',
  COMPLETED: null,
}

/** 관리자 재고 화면에 표시할 메뉴 ID */
export const INVENTORY_MENU_IDS = ['americano-ice', 'americano-hot', 'cafe-latte']
