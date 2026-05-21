import { useCallback, useEffect, useState } from 'react'
import { Header } from './components/Header.jsx'
import { OrderPage } from './pages/OrderPage.jsx'
import { AdminPage } from './pages/AdminPage.jsx'
import { INITIAL_INVENTORY } from './data/inventoryMenus.js'
import { addToCart } from './lib/cart.js'
import {
  adjustInventory,
  canAddMenuToCart,
  deductInventoryForCart,
  validateCartAgainstInventory,
} from './lib/inventory.js'
import { createOrderFromCart, startOrderPreparation } from './lib/orders.js'
import './App.css'

function App() {
  const [page, setPage] = useState('order')
  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState([])
  const [inventory, setInventory] = useState(INITIAL_INVENTORY)

  useEffect(() => {
    document.title = 'COZY - 커피 주문 앱'
  }, [])

  const handleAddToCart = useCallback(
    (menu, selectedOptionIds) => {
      setCart((prev) => {
        if (!canAddMenuToCart(inventory, prev, menu.id)) {
          return prev
        }
        return addToCart(prev, menu, selectedOptionIds)
      })
    },
    [inventory],
  )

  const handlePlaceOrder = useCallback(() => {
    if (cart.length === 0) return

    const validation = validateCartAgainstInventory(inventory, cart)
    if (!validation.ok) {
      alert(validation.message)
      return
    }

    setInventory((prev) => deductInventoryForCart(prev, cart))
    setOrders((prev) => [...prev, createOrderFromCart(cart)])
    setCart([])
    alert('주문이 접수되었습니다.')
  }, [cart, inventory])

  const handleAdjustInventory = useCallback((menuId, delta) => {
    setInventory((prev) => adjustInventory(prev, menuId, delta))
  }, [])

  const handleStartPreparation = useCallback((orderId) => {
    setOrders((prev) => startOrderPreparation(prev, orderId))
  }, [])

  return (
    <div className="app">
      <Header activePage={page} onNavigate={setPage} />
      <div className={page === 'order' ? 'app__page app__page--active' : 'app__page app__page--hidden'}>
        <OrderPage
          cart={cart}
          inventory={inventory}
          onAddToCart={handleAddToCart}
          onPlaceOrder={handlePlaceOrder}
        />
      </div>
      <div className={page === 'admin' ? 'app__page app__page--active' : 'app__page app__page--hidden'}>
        <AdminPage
          orders={orders}
          inventory={inventory}
          onAdjustInventory={handleAdjustInventory}
          onStartPreparation={handleStartPreparation}
        />
      </div>
    </div>
  )
}

export default App
