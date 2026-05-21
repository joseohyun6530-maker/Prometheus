export function createOrderId() {
  return `ord_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function createLineId() {
  return `line_${Math.random().toString(36).slice(2, 11)}`
}

export function createOptionLineId() {
  return `opt_${Math.random().toString(36).slice(2, 11)}`
}
