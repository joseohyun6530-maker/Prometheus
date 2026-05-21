import { AdminDashboard } from '../components/admin/AdminDashboard.jsx'
import { InventorySection } from '../components/admin/InventorySection.jsx'
import { OrderListSection } from '../components/admin/OrderListSection.jsx'

/**
 * @param {{
 *   dashboard: { total: number; received: number; inPreparation: number; completed: number }
 *   inventoryItems: import('../api/types.js').ApiInventoryItem[]
 *   orders: import('../lib/orders.js').Order[]
 *   loading?: boolean
 *   onAdjustInventory: (menuId: string, delta: number) => void
 *   onUpdateOrderStatus: (orderId: string, status: 'IN_PREPARATION' | 'COMPLETED') => void
 * }} props
 */
export function AdminPage({
  dashboard,
  inventoryItems,
  orders,
  loading,
  onAdjustInventory,
  onUpdateOrderStatus,
}) {
  if (loading) {
    return (
      <main className="admin-page">
        <p className="page-message">관리자 데이터를 불러오는 중...</p>
      </main>
    )
  }

  return (
    <main className="admin-page">
      <AdminDashboard stats={dashboard} />
      <InventorySection items={inventoryItems} onAdjustInventory={onAdjustInventory} />
      <OrderListSection orders={orders} onUpdateStatus={onUpdateOrderStatus} />
    </main>
  )
}
