import { getStockStatus, getStockStatusClass } from '../../lib/inventory.js'

/**
 * @param {{
 *   menus: import('../../data/menus.js').MenuItem[]
 *   inventory: Record<string, number>
 *   onAdjustInventory: (menuId: string, delta: number) => void
 * }} props
 */
export function InventorySection({ menus, inventory, onAdjustInventory }) {
  return (
    <section className="admin-section" aria-labelledby="inventory-heading">
      <h2 id="inventory-heading" className="admin-section__title">
        재고 현황
      </h2>
      <div className="inventory-grid">
        {menus.map((menu) => {
          const quantity = inventory[menu.id] ?? 0
          const status = getStockStatus(quantity)

          return (
            <article key={menu.id} className="inventory-card">
              <h3 className="inventory-card__name">{menu.name}</h3>
              <p className="inventory-card__qty">
                <span className="inventory-card__count">{quantity}개</span>
                <span className={`stock-badge ${getStockStatusClass(status)}`}>{status}</span>
              </p>
              <div className="inventory-card__actions">
                <button
                  type="button"
                  className="btn btn--outline inventory-card__btn"
                  aria-label={`${menu.name} 재고 감소`}
                  onClick={() => onAdjustInventory(menu.id, -1)}
                  disabled={quantity <= 0}
                >
                  −
                </button>
                <button
                  type="button"
                  className="btn btn--primary inventory-card__btn"
                  aria-label={`${menu.name} 재고 증가`}
                  onClick={() => onAdjustInventory(menu.id, 1)}
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
