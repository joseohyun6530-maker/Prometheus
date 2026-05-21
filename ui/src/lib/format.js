/**
 * @param {number} amount
 * @returns {string}
 */
export function formatPrice(amount) {
  return `${amount.toLocaleString('ko-KR')}원`
}
