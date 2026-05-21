/**
 * @param {number} quantity
 * @returns {'정상' | '주의' | '품절'}
 */
export function getStockStatus(quantity) {
  if (quantity <= 0) return '품절'
  if (quantity < 5) return '주의'
  return '정상'
}
