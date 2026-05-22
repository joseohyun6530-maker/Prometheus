import { getStockStatus, getStockStatusClass } from '../../lib/inventory.js'

/**
 * @param {{
 *   items: import('../../api/types.js').ApiInventoryItem[]
 *   onAdjustInventory: (menuId: string, delta: number) => void
 * }} props
 */
export function InventorySection({ items, onAdjustInventory }) {
  if (items.length === 0) {
    return (
      <section className="admin-section" aria-labelledby="inventory-heading">
        <h2 id="inventory-heading" className="admin-section__title">
          재고 현황
        </h2>
        <p className="admin-empty">재고 데이터를 불러오지 못했습니다.</p>
      </section>
    )
  }

  return (
    <section className="admin-section" aria-labelledby="inventory-heading">
      <h2 id="inventory-heading" className="admin-section__title">
        재고 현황
      </h2>
      <div className="inventory-grid">
        {items.map((item) => {
          const qty = Number(item.stock_quantity)
          const displayQty = Number.isFinite(qty) ? qty : 0
          const statusLabel = item.stock_status || getStockStatus(displayQty)

          return (
            <article key={item.menu_id} className="inventory-card">
              <h3 className="inventory-card__name">{item.name}</h3>
              <p className="inventory-card__qty">
                <span className="inventory-card__count" aria-label="재고 수량">
                  {displayQty}
                  <span className="inventory-card__unit">개</span>
                </span>
                <span className={`stock-badge ${getStockStatusClass(statusLabel)}`}>
                  {statusLabel}
                </span>
              </p>
              <div className="inventory-card__actions">
                <button
                  type="button"
                  className="btn btn--outline inventory-card__btn"
                  aria-label={`${item.name} 재고 1개 감소`}
                  onClick={() => onAdjustInventory(item.menu_id, -1)}
                  disabled={displayQty <= 0}
                >
                  −
                </button>
                <button
                  type="button"
                  className="btn btn--primary inventory-card__btn"
                  aria-label={`${item.name} 재고 1개 증가`}
                  onClick={() => onAdjustInventory(item.menu_id, 1)}
                >
                  +
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
