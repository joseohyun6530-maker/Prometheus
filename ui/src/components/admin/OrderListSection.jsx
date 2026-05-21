import { formatPrice } from '../../lib/format.js'
import { formatOrderDateTime, formatOrderLineLabel, ORDER_STATUS_LABEL } from '../../lib/orders.js'

/**
 * @param {{
 *   orders: import('../../lib/orders.js').Order[]
 *   onUpdateStatus: (orderId: string, status: 'IN_PREPARATION' | 'COMPLETED') => void
 * }} props
 */
export function OrderListSection({ orders, onUpdateStatus }) {
  return (
    <section className="admin-section" aria-labelledby="orders-heading">
      <h2 id="orders-heading" className="admin-section__title">
        주문 현황
      </h2>
      {orders.length === 0 ? (
        <p className="admin-empty">접수된 주문이 없습니다.</p>
      ) : (
        <ul className="order-list">
          {orders.map((order) => (
            <li key={order.id} className="order-card">
              <div className="order-card__header">
                <time className="order-card__time" dateTime={order.orderedAt}>
                  {formatOrderDateTime(order.orderedAt)}
                </time>
                <span
                  className={`order-status order-status--${
                    order.status === 'IN_PREPARATION'
                      ? 'preparing'
                      : order.status === 'RECEIVED'
                        ? 'received'
                        : 'completed'
                  }`}
                >
                  {ORDER_STATUS_LABEL[order.status]}
                </span>
              </div>
              <ul className="order-card__lines">
                {order.lines.map((line) => (
                  <li key={line.key} className="order-card__line">
                    <span className="order-card__line-name">{formatOrderLineLabel(line)}</span>
                    <span className="order-card__line-price">{formatPrice(line.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="order-card__footer">
                <span className="order-card__total-label">주문 금액</span>
                <strong className="order-card__total">{formatPrice(order.totalAmount)}</strong>
                {order.status === 'RECEIVED' && (
                  <button
                    type="button"
                    className="btn btn--primary btn--order-action"
                    onClick={() => onUpdateStatus(order.id, 'IN_PREPARATION')}
                  >
                    제조 시작
                  </button>
                )}
                {order.status === 'IN_PREPARATION' && (
                  <button
                    type="button"
                    className="btn btn--primary btn--order-action"
                    onClick={() => onUpdateStatus(order.id, 'COMPLETED')}
                  >
                    제조 완료
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
