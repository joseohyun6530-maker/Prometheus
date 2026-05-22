import { useCallback, useEffect, useState } from 'react'
import { fetchInventory, fetchAdminOrders, patchInventory, patchOrderStatus } from './api/admin.js'
import { formatFetchError } from './api/errors.js'
import { mapApiOrderToOrder } from './api/mapOrder.js'
import { buildInventoryFromMenus, mapApiMenuToMenuItem } from './api/mapMenu.js'
import { fetchMenus } from './api/menus.js'
import { createOrder } from './api/orders.js'
import { Header } from './components/Header.jsx'
import { OrderPage } from './pages/OrderPage.jsx'
import { AdminPage } from './pages/AdminPage.jsx'
import {
  getDemoAdminState,
  getDemoOrderState,
  OFFLINE_ACTION_MESSAGE,
  OFFLINE_NOTICE,
} from './lib/demoData.js'
import { addToCart } from './lib/cart.js'
import { canAddMenuToCart, validateCartAgainstInventory } from './lib/inventory.js'
import { getActiveOrders } from './lib/orders.js'
import './App.css'

const EMPTY_DASHBOARD = { total: 0, received: 0, inPreparation: 0, completed: 0 }

function applyDemoAdminState(setters) {
  const demo = getDemoAdminState()
  setters.setOrders(demo.orders)
  setters.setDashboard(demo.dashboard)
  setters.setInventoryItems(demo.inventoryItems)
  setters.setInventory((prev) => ({ ...prev, ...demo.inventory }))
}

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
  const [apiOnline, setApiOnline] = useState(false)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    document.title = 'COZY - 커피 주문 앱'
  }, [])

  const loadMenus = useCallback(async () => {
    const data = await fetchMenus()
    setMenus(data.menus.map(mapApiMenuToMenuItem))
    setInventory(buildInventoryFromMenus(data.menus))
    setApiOnline(true)
    setNotice(null)
  }, [])

  const loadAdmin = useCallback(async () => {
    const [ordersData, inventoryData] = await Promise.all([
      fetchAdminOrders(),
      fetchInventory(),
    ])
    setOrders(ordersData.orders.map(mapApiOrderToOrder))
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
    setApiOnline(true)
    setNotice(null)
  }, [])

  const enterOfflineMode = useCallback((applyOrderDemo, applyAdminDemo) => {
    setApiOnline(false)
    setNotice(OFFLINE_NOTICE)
    if (applyOrderDemo) {
      const demo = getDemoOrderState()
      setMenus(demo.menus)
      setInventory(demo.inventory)
    }
    if (applyAdminDemo) {
      applyDemoAdminState({
        setOrders,
        setDashboard,
        setInventoryItems,
        setInventory,
      })
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    fetchMenus()
      .then((data) => {
        if (cancelled) return
        setMenus(data.menus.map(mapApiMenuToMenuItem))
        setInventory(buildInventoryFromMenus(data.menus))
        setApiOnline(true)
        setNotice(null)
      })
      .catch(() => {
        if (!cancelled) enterOfflineMode(true, false)
      })
      .finally(() => {
        if (!cancelled) setOrderLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [enterOfflineMode])

  const handleNavigate = useCallback(
    (next) => {
      setPage(next)
      if (next !== 'admin') return

      setAdminLoadState('loading')
      loadAdmin()
        .catch(() => enterOfflineMode(false, true))
        .finally(() => setAdminLoadState('done'))
    },
    [loadAdmin, enterOfflineMode],
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

    if (!apiOnline) {
      alert(OFFLINE_ACTION_MESSAGE)
      return
    }

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
      alert(formatFetchError(err))
    }
  }, [cart, inventory, loadMenus, loadAdmin, page, apiOnline])

  const handleAdjustInventory = useCallback(
    async (menuId, delta) => {
      if (!apiOnline) {
        alert(OFFLINE_ACTION_MESSAGE)
        return
      }

      try {
        await patchInventory(menuId, delta)
        await Promise.all([loadMenus(), loadAdmin()])
      } catch (err) {
        alert(formatFetchError(err))
      }
    },
    [loadMenus, loadAdmin, apiOnline],
  )

  const handleUpdateOrderStatus = useCallback(
    async (orderId, status) => {
      if (!apiOnline) {
        alert(OFFLINE_ACTION_MESSAGE)
        return
      }

      try {
        await patchOrderStatus(orderId, status)
        await loadAdmin()
      } catch (err) {
        alert(formatFetchError(err))
      }
    },
    [loadAdmin, apiOnline],
  )

  const activeOrders = getActiveOrders(orders)

  return (
    <div className="app">
      <Header activePage={page} onNavigate={handleNavigate} />
      {notice && (
        <p className="app-notice" role="status">
          {notice}
        </p>
      )}
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
