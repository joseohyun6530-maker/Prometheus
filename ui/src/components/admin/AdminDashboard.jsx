/**
 * @param {{ stats: { total: number; received: number; inPreparation: number; completed: number } }} props
 */
export function AdminDashboard({ stats }) {
  const items = [
    { label: '총 주문', value: stats.total },
    { label: '주문 접수', value: stats.received },
    { label: '제조 중', value: stats.inPreparation },
    { label: '제조 완료', value: stats.completed },
  ]

  return (
    <section className="admin-section" aria-labelledby="dashboard-heading">
      <h2 id="dashboard-heading" className="admin-section__title">
        관리자 대시보드
      </h2>
      <div className="dashboard-bar">
        {items.map((item, index) => (
          <span key={item.label} className="dashboard-bar__item">
            {index > 0 && <span className="dashboard-bar__sep">/</span>}
            <span className="dashboard-bar__label">{item.label}</span>
            <strong className="dashboard-bar__value">{item.value}</strong>
          </span>
        ))}
      </div>
    </section>
  )
}
