/**
 * @param {{ activePage: 'order' | 'admin'; onNavigate: (page: 'order' | 'admin') => void }} props
 */
export function Header({ activePage, onNavigate }) {
  return (
    <header className="header">
      <div className="header__brand">COZY</div>
      <nav className="header__nav" aria-label="메인 메뉴">
        <button
          type="button"
          className={`nav-btn ${activePage === 'order' ? 'nav-btn--active' : ''}`}
          onClick={() => onNavigate('order')}
        >
          주문하기
        </button>
        <button
          type="button"
          className={`nav-btn ${activePage === 'admin' ? 'nav-btn--active' : ''}`}
          onClick={() => onNavigate('admin')}
        >
          관리자
        </button>
      </nav>
    </header>
  )
}
