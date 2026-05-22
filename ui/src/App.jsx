import { useCallback, useEffect, useState } from 'react'
import { fetchInventory, fetchAdminOrders, patchInventory, patchOrderStatus } from './api/admin.js'
import { buildInventoryFromMenus, mapApiMenuToMenuItem } from './api/mapMenu.js'
import { fetchMenus } from './api/menus.js'
import { createOrder } from './api/orders.js'
import { Header } from './components/Header.jsx'
import { OrderPage } from './pages/OrderPage.jsx'
import { AdminPage } from './pages/AdminPage.jsx'
import { DEFAULT_ORDER_INVENTORY, MENUS } from './data/menus.js'
import { addToCart } from './lib/cart.js'
import { canAddMenuToCart, validateCartAgainstInventory } from './lib/inventory.js'
import { getActiveOrders } from './lib/orders.js'
import './App.css'

const EMPTY_DASHBOARD = { total: 0, received: 0, inPreparation: 0, completed: 0 }

function App() {
  const [page, setPage] = useState('order')
  const [cart, setCart] = useState([])
  const [menus, setMenus] = useState([])
  const [inventory, setInventory] = useState({})
  const [orders, setOrders] = useState([])
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD)
  const [inventoryItems, setInventoryItems] = useState([])
  const [orderLoading, setOrderLoading] = useState(true)
  const [adminLoadState, setAdminLoadState] = useState('idle')
  const [error, setError] = useState(null)

  useEffect(() => {
    document.title = 'COZY - 커피 주문 앱'
  }, [])

  const loadMenus = useCallback(async () => {
    const data = await fetchMenus()
    setMenus(data.menus.map(mapApiMenuToMenuItem))
    setInventory(buildInventoryFromMenus(data.menus))
  }, [])

  const loadAdmin = useCallback(async () => {
    const [ordersData, inventoryData] = await Promise.all([
      fetchAdminOrders(),
      fetchInventory(),
    ])
    setOrders(ordersData.orders)
    setDashboard({
      total: ordersData.dashboard.total,
      received: ordersData.dashboard.received,
      inPreparation: ordersData.dashboard.in_preparation,
      completed: ordersData.dashboard.completed,
    })
    setInventoryItems(
      inventoryData.items.map((item) => ({
        ...item,
        stock_quantity: Number(item.stock_quantity),
      })),
    )
    setInventory((prev) => {
      const next = { ...prev }
      for (const item of inventoryData.items) {
        next[item.menu_id] = item.stock_quantity
      }
      return next
    })
  }, [])

  useEffect(() => {
    let cancelled = false

    fetchMenus()
      .then((data) => {
        if (cancelled) return
        setMenus(data.menus.map(mapApiMenuToMenuItem))
        setInventory(buildInventoryFromMenus(data.menus))
        setError(null)
      })
      .catch((err) => {
        if (!cancelled) {
          setMenus(MENUS)
          setInventory({ ...DEFAULT_ORDER_INVENTORY })
          setError(
            err instanceof Error
              ? `${err.message} (로컬 메뉴로 표시 중)`
              : '메뉴 로드 실패 (로컬 메뉴로 표시 중)',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setOrderLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleNavigate = useCallback(
    (next) => {
      setPage(next)
      if (next !== 'admin') return

      setAdminLoadState('loading')
      loadAdmin()
        .then(() => setError(null))
        .catch((err) =>
          setError(err instanceof Error ? err.message : '관리자 데이터 로드 실패'),
        )
        .finally(() => setAdminLoadState('done'))
    },
    [loadAdmin],
  )

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

  const handlePlaceOrder = useCallback(async () => {
    if (cart.length === 0) return

    const validation = validateCartAgainstInventory(inventory, cart)
    if (!validation.ok) {
      alert(validation.message)
      return
    }

    try {
      const items = cart.map((line) => ({
        menu_id: line.menuId,
        quantity: line.quantity,
        option_ids: line.selectedOptionIds,
      }))
      await createOrder(items)
      setCart([])
      alert('주문이 접수되었습니다.')
      await loadMenus()
      if (page === 'admin') await loadAdmin()
    } catch (err) {
      alert(err instanceof Error ? err.message : '주문에 실패했습니다.')
    }
  }, [cart, inventory, loadMenus, loadAdmin, page])

  const handleAdjustInventory = useCallback(
    async (menuId, delta) => {
      try {
        await patchInventory(menuId, delta)
        await Promise.all([loadMenus(), loadAdmin()])
      } catch (err) {
        alert(err instanceof Error ? err.message : '재고 수정에 실패했습니다.')
      }
    },
    [loadMenus, loadAdmin],
  )

  const handleUpdateOrderStatus = useCallback(
    async (orderId, status) => {
      try {
        await patchOrderStatus(orderId, status)
        await loadAdmin()
      } catch (err) {
        alert(err instanceof Error ? err.message : '상태 변경에 실패했습니다.')
      }
    },
    [loadAdmin],
  )

  const activeOrders = getActiveOrders(orders)

  return (
    <div className="app">
      <Header activePage={page} onNavigate={handleNavigate} />
      {error && <p className="app-error">{error}</p>}
      <div className={page === 'order' ? 'app__page app__page--active' : 'app__page app__page--hidden'}>
        <OrderPage
          menus={menus}
          cart={cart}
          inventory={inventory}
          loading={orderLoading}
          onAddToCart={handleAddToCart}
          onPlaceOrder={handlePlaceOrder}
        />
      </div>
      <div className={page === 'admin' ? 'app__page app__page--active' : 'app__page app__page--hidden'}>
        <AdminPage
          dashboard={dashboard}
          inventoryItems={inventoryItems}
          orders={activeOrders}
          loading={page === 'admin' && adminLoadState === 'loading'}
          onAdjustInventory={handleAdjustInventory}
          onUpdateOrderStatus={handleUpdateOrderStatus}
        />
      </div>
    </div>
  )
}

export default App
