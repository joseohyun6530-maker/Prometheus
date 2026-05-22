import { useState } from 'react'
import { formatPrice } from '../lib/format.js'
import { getStockStatusClass } from '../lib/inventory.js'

/**
 * @param {{
 *   menu: import('../data/menus.js').MenuItem
 *   stock: number | null
 *   stockStatus: '정상' | '주의' | '품절' | null
 *   soldOut: boolean
 *   canAdd: boolean
 *   showStockBadge?: boolean
 *   onAdd: (menu: import('../data/menus.js').MenuItem, selectedOptionIds: string[]) => void
 * }} props
 */
export function ProductCard({
  menu,
  stock,
  stockStatus,
  soldOut,
  canAdd,
  showStockBadge = true,
  onAdd,
}) {
  const [selectedOptionIds, setSelectedOptionIds] = useState([])

  const toggleOption = (optionId) => {
    setSelectedOptionIds((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId],
    )
  }

  const handleAdd = () => {
    if (!canAdd) return
    onAdd(menu, [...selectedOptionIds])
    setSelectedOptionIds([])
  }

  return (
    <article className={`product-card ${soldOut ? 'product-card--soldout' : ''}`}>
      <div className="product-card__image">
        {menu.imageUrl ? (
          <img src={menu.imageUrl} alt={menu.name} className="product-card__img" />
        ) : (
          <span className="product-card__placeholder" aria-hidden="true">
            ×
          </span>
        )}
      </div>
      <div className="product-card__head">
        <h3 className="product-card__name">{menu.name}</h3>
        {showStockBadge && stockStatus && stock !== null && (
          <span className={`stock-badge ${getStockStatusClass(stockStatus)}`}>
            {stockStatus} · {stock}개
          </span>
        )}
      </div>
      <p className="product-card__price">{formatPrice(menu.basePrice)}</p>
      <p className="product-card__desc">{menu.description}</p>
      <fieldset className="product-card__options" disabled={soldOut}>
        <legend className="visually-hidden">{menu.name} 옵션</legend>
        {menu.options.map((option) => (
          <label key={option.id} className="product-card__option">
            <input
              type="checkbox"
              checked={selectedOptionIds.includes(option.id)}
              onChange={() => toggleOption(option.id)}
              disabled={soldOut}
            />
            <span>
              {option.label} ({option.extraPrice >= 0 ? '+' : ''}
              {formatPrice(option.extraPrice)})
            </span>
          </label>
        ))}
      </fieldset>
      <button
        type="button"
        className="btn btn--primary product-card__add"
        onClick={handleAdd}
        disabled={soldOut || !canAdd}
      >
        {soldOut ? '품절' : !canAdd ? '재고 부족' : '담기'}
      </button>
    </article>
  )
}
