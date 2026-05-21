import { useMemo } from 'react'
import { INVENTORY_MENUS } from '../data/inventoryMenus.js'
import { calcDashboardStats, getActiveOrders } from '../lib/orders.js'
import { AdminDashboard } from '../components/admin/AdminDashboard.jsx'
import { InventorySection } from '../components/admin/InventorySection.jsx'
import { OrderListSection } from '../components/admin/OrderListSection.jsx'

/**
 * @param {{
 *   orders: import('../lib/orders.js').Order[]
 *   inventory: Record<string, number>
 *   onInventoryChange: (next: Record<string, number>) => void
 *   onStartPreparation: (orderId: string) => void
 * }} props
 */
export function AdminPage({ orders, inventory, onInventoryChange, onStartPreparation }) {
  const stats = useMemo(() => calcDashboardStats(orders), [orders])
  const activeOrders = useMemo(() => getActiveOrders(orders), [orders])

  return (
    <main className="admin-page">
      <AdminDashboard stats={stats} />
      <InventorySection
        menus={INVENTORY_MENUS}
        inventory={inventory}
        onInventoryChange={onInventoryChange}
      />
      <OrderListSection orders={activeOrders} onStartPreparation={onStartPreparation} />
    </main>
  )
}
