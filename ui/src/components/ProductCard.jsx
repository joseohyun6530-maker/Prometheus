import { useState } from 'react'
import { formatPrice } from '../lib/format.js'

/**
 * @param {{
 *   menu: import('../data/menus.js').MenuItem
 *   onAdd: (menu: import('../data/menus.js').MenuItem, selectedOptionIds: string[]) => void
 * }} props
 */
export function ProductCard({ menu, onAdd }) {
  const [selectedOptionIds, setSelectedOptionIds] = useState([])

  const toggleOption = (optionId) => {
    setSelectedOptionIds((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId],
    )
  }

  const handleAdd = () => {
    onAdd(menu, selectedOptionIds)
  }

  return (
    <article className="product-card">
      <div className="product-card__image" aria-hidden="true">
        <span className="product-card__placeholder">×</span>
      </div>
      <h3 className="product-card__name">{menu.name}</h3>
      <p className="product-card__price">{formatPrice(menu.basePrice)}</p>
      <p className="product-card__desc">{menu.description}</p>
      <fieldset className="product-card__options">
        <legend className="visually-hidden">{menu.name} 옵션</legend>
        {menu.options.map((option) => (
          <label key={option.id} className="product-card__option">
            <input
              type="checkbox"
              checked={selectedOptionIds.includes(option.id)}
              onChange={() => toggleOption(option.id)}
            />
            <span>
              {option.label} ({option.extraPrice >= 0 ? '+' : ''}
              {formatPrice(option.extraPrice)})
            </span>
          </label>
        ))}
      </fieldset>
      <button type="button" className="btn btn--primary product-card__add" onClick={handleAdd}>
        담기
      </button>
    </article>
  )
}
