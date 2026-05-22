import { calcCartTotal, formatOptionSuffix } from '../lib/cart.js'
import { formatPrice } from '../lib/format.js'

/**
 * @param {{
 *   cart: import('../lib/cart.js').CartLine[]
 *   onOrder: () => void
 * }} props
 */
export function Cart({ cart, onOrder }) {
  const total = calcCartTotal(cart)
  const isEmpty = cart.length === 0

  return (
    <section className="cart" aria-labelledby="cart-heading">
      <h2 id="cart-heading" className="cart__title">
        장바구니
      </h2>
      <div className="cart__panel">
        <div className="cart__items">
          {isEmpty ? (
            <p className="cart__empty">담은 메뉴가 없습니다.</p>
          ) : (
            <ul className="cart__list">
              {cart.map((line) => (
                <li key={line.key} className="cart__line">
                  <span className="cart__line-name">
                    {line.name}
                    {formatOptionSuffix(line.selectedOptions)}
                    <span className="cart__line-qty"> X {line.quantity}</span>
                  </span>
                  <span className="cart__line-price">{formatPrice(line.lineTotal)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="cart__summary">
          <p className="cart__total">
            <span className="cart__total-label">총 금액</span>
            <strong className="cart__total-amount">{formatPrice(total)}</strong>
          </p>
          <button
            type="button"
            className="btn btn--primary btn--large cart__order"
            disabled={isEmpty}
            onClick={onOrder}
          >
            주문하기
          </button>
        </div>
      </div>
    </section>
  )
}
