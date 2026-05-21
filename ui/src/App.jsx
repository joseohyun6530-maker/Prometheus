import { useCallback, useEffect, useState } from 'react'
import { Header } from './components/Header.jsx'
import { OrderPage } from './pages/OrderPage.jsx'
import { AdminPage } from './pages/AdminPage.jsx'
import { INITIAL_INVENTORY } from './data/inventoryMenus.js'
import { createOrderFromCart, startOrderPreparation } from './lib/orders.js'
import './App.css'

function App() {
  const [page, setPage] = useState('order')
  const [orders, setOrders] = useState([])
  const [inventory, setInventory] = useState(INITIAL_INVENTORY)

  useEffect(() => {
    document.title = 'COZY - 커피 주문 앱'
  }, [])

  const handlePlaceOrder = useCallback((cart) => {
    setOrders((prev) => [...prev, createOrderFromCart(cart)])
  }, [])

  const handleStartPreparation = useCallback((orderId) => {
    setOrders((prev) => startOrderPreparation(prev, orderId))
  }, [])

  return (
    <div className="app">
      <Header activePage={page} onNavigate={setPage} />
      {page === 'order' ? (
        <OrderPage onPlaceOrder={handlePlaceOrder} />
      ) : (
        <AdminPage
          orders={orders}
          inventory={inventory}
          onInventoryChange={setInventory}
          onStartPreparation={handleStartPreparation}
        />
      )}
    </div>
  )
}

export default App
