import { useState } from 'react'
import { MENUS } from '../data/menus.js'
import { addToCart } from '../lib/cart.js'
import { ProductCard } from '../components/ProductCard.jsx'
import { Cart } from '../components/Cart.jsx'

/**
 * @param {{ onPlaceOrder: (cart: import('../lib/cart.js').CartLine[]) => void }} props
 */
export function OrderPage({ onPlaceOrder }) {
  const [cart, setCart] = useState([])

  const handleAddToCart = (menu, selectedOptionIds) => {
    setCart((prev) => addToCart(prev, menu, selectedOptionIds))
  }

  const handleOrder = () => {
    if (cart.length === 0) return
    onPlaceOrder(cart)
    alert('주문이 접수되었습니다.')
    setCart([])
  }

  return (
    <main className="order-page">
      <section className="menu-section" aria-labelledby="menu-heading">
        <h2 id="menu-heading" className="visually-hidden">
          메뉴
        </h2>
        <div className="menu-grid">
          {MENUS.map((menu) => (
            <ProductCard key={menu.id} menu={menu} onAdd={handleAddToCart} />
          ))}
        </div>
      </section>
      <Cart cart={cart} onOrder={handleOrder} />
    </main>
  )
}
