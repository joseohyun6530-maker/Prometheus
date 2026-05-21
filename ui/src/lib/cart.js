/**
 * @param {string} menuId
 * @param {string[]} optionIds
 */
export function cartLineKey(menuId, optionIds) {
  return `${menuId}:${[...optionIds].sort().join(',')}`
}

/**
 * @param {{ id: string; label: string; extraPrice: number }[]} allOptions
 * @param {string[]} selectedIds
 */
export function getSelectedOptions(allOptions, selectedIds) {
  return allOptions.filter((o) => selectedIds.includes(o.id))
}

/**
 * @param {import('../data/menus.js').MenuItem} menu
 * @param {string[]} selectedOptionIds
 */
export function calcUnitPrice(menu, selectedOptionIds) {
  const selected = getSelectedOptions(menu.options, selectedOptionIds)
  return menu.basePrice + selected.reduce((sum, o) => sum + o.extraPrice, 0)
}

/**
 * @param {{ label: string }[]} selectedOptions
 */
export function formatOptionSuffix(selectedOptions) {
  if (selectedOptions.length === 0) return ''
  const labels = selectedOptions.map((o) => o.label).join(', ')
  return ` (${labels})`
}

/**
 * @typedef {object} CartLine
 * @property {string} key
 * @property {string} menuId
 * @property {string} name
 * @property {string[]} selectedOptionIds
 * @property {{ id: string; label: string; extraPrice: number }[]} selectedOptions
 * @property {number} unitPrice
 * @property {number} quantity
 * @property {number} lineTotal
 */

/**
 * @param {CartLine[]} cart
 * @param {import('../data/menus.js').MenuItem} menu
 * @param {string[]} selectedOptionIds
 * @returns {CartLine[]}
 */
export function addToCart(cart, menu, selectedOptionIds) {
  const normalizedOptionIds = [...selectedOptionIds].sort()
  const selectedOptions = getSelectedOptions(menu.options, normalizedOptionIds)
  const key = cartLineKey(menu.id, normalizedOptionIds)
  const unitPrice = calcUnitPrice(menu, normalizedOptionIds)
  const existing = cart.find((line) => line.key === key)

  if (existing) {
    return cart.map((line) =>
      line.key === key
        ? {
            ...line,
            quantity: line.quantity + 1,
            lineTotal: (line.quantity + 1) * line.unitPrice,
          }
        : line,
    )
  }

  return [
    ...cart,
    {
      key,
      menuId: menu.id,
      name: menu.name,
      selectedOptionIds: normalizedOptionIds,
      selectedOptions,
      unitPrice,
      quantity: 1,
      lineTotal: unitPrice,
    },
  ]
}

/**
 * @param {CartLine[]} cart
 * @returns {number}
 */
export function calcCartTotal(cart) {
  return cart.reduce((sum, line) => sum + line.lineTotal, 0)
}

/**
 * @param {CartLine[]} cart
 * @param {string} lineKey
 * @param {number} delta
 * @returns {CartLine[]}
 */
export function updateCartLineQuantity(cart, lineKey, delta) {
  return cart
    .map((line) => {
      if (line.key !== lineKey) return line
      const quantity = line.quantity + delta
      if (quantity <= 0) return null
      return {
        ...line,
        quantity,
        lineTotal: line.unitPrice * quantity,
      }
    })
    .filter(Boolean)
}
