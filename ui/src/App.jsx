import { useEffect, useState } from 'react'
import { Header } from './components/Header.jsx'
import { OrderPage } from './pages/OrderPage.jsx'
import { AdminPage } from './pages/AdminPage.jsx'
import './App.css'

function App() {
  const [page, setPage] = useState('order')

  useEffect(() => {
    document.title = 'COZY - 커피 주문 앱'
  }, [])

  return (
    <div className="app">
      <Header activePage={page} onNavigate={setPage} />
      {page === 'order' ? <OrderPage /> : <AdminPage />}
    </div>
  )
}

export default App
