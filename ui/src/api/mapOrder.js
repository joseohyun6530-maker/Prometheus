/**
 * @param {Record<string, unknown>} line
 */
function mapApiOrderLine(line) {
  const selectedOptions = Array.isArray(line.selectedOptions)
    ? line.selectedOptions.map((opt) => ({
        id: opt.id,
        label: opt.label ?? opt.option_name,
        extraPrice: opt.extraPrice ?? opt.option_price ?? 0,
      }))
    : []

  return {
    key: String(line.key ?? `${line.menu_id}:`),
    menuId: String(line.menu_id),
    name: String(line.menu_name ?? line.name ?? ''),
    quantity: Number(line.quantity),
    unitPrice: Number(line.unit_price ?? line.unitPrice),
    lineTotal: Number(line.line_total ?? line.lineTotal),
    selectedOptionIds: line.selectedOptionIds ?? [],
    selectedOptions,
  }
}

/**
 * @param {Record<string, unknown>} apiOrder
 * @returns {import('../lib/orders.js').Order}
 */
export function mapApiOrderToOrder(apiOrder) {
  const rawLines = apiOrder.lines ?? apiOrder.items ?? []
  const lines = Array.isArray(rawLines) ? rawLines.map(mapApiOrderLine) : []

  return {
    id: String(apiOrder.id),
    orderedAt: String(apiOrder.orderedAt ?? apiOrder.ordered_at ?? ''),
    status: /** @type {import('../lib/orders.js').Order['status']} */ (apiOrder.status),
    totalAmount: Number(apiOrder.totalAmount ?? apiOrder.total_amount),
    lines,
  }
}
