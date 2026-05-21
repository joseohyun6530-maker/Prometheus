import {
  canAddMenuToCart,
  getMenuStock,
  getStockStatus,
  isInventoryTracked,
} from '../lib/inventory.js'
import { ProductCard } from '../components/ProductCard.jsx'
import { Cart } from '../components/Cart.jsx'

/**
 * @param {{
 *   menus: import('../data/menus.js').MenuItem[]
 *   cart: import('../lib/cart.js').CartLine[]
 *   inventory: Record<string, number>
 *   loading?: boolean
 *   onAddToCart: (menu: import('../data/menus.js').MenuItem, selectedOptionIds: string[]) => void
 *   onPlaceOrder: () => void
 *   onChangeQuantity: (lineKey: string, delta: number) => void
 * }} props
 */
export function OrderPage({
  menus,
  cart,
  inventory,
  loading,
  onAddToCart,
  onPlaceOrder,
  onChangeQuantity,
}) {
  if (loading) {
    return (
      <main className="order-page">
        <p className="page-message">메뉴를 불러오는 중...</p>
      </main>
    )
  }

  return (
    <main className="order-page">
      <section className="menu-section" aria-labelledby="menu-heading">
        <h2 id="menu-heading" className="visually-hidden">
          메뉴
        </h2>
        <div className="menu-grid">
          {menus.map((menu) => {
            const tracked = isInventoryTracked(menu.id)
            const stock = getMenuStock(inventory, menu.id)
            const stockStatus = tracked && stock !== null ? getStockStatus(stock) : null
            const soldOut = tracked && stock === 0
            const canAdd = canAddMenuToCart(inventory, cart, menu.id)

            return (
              <ProductCard
                key={menu.id}
                menu={menu}
                stock={stock}
                stockStatus={stockStatus}
                soldOut={soldOut}
                canAdd={canAdd}
                onAdd={onAddToCart}
              />
            )
          })}
        </div>
      </section>
      <Cart cart={cart} onOrder={onPlaceOrder} onChangeQuantity={onChangeQuantity} />
    </main>
  )
}
