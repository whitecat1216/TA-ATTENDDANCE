import { NavLink } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const navItems = [
  { to: '/',                label: 'ダッシュボード',   icon: '🏠' },
  { to: '/time-tracking',   label: '打刻・勤怠入力',   icon: '⏰' },
  { to: '/shift',           label: 'シフト管理',       icon: '📅' },
  { to: '/leave',           label: '休暇管理',         icon: '🌴' },
  { to: '/summary',         label: '勤怠集計照会',     icon: '📊' },
  { to: '/employees',       label: '従業員管理',       icon: '👥', adminOnly: true },
  { to: '/reports',         label: 'CSVエクスポート',  icon: '📤' },
]

export function Sidebar() {
  const { user, logout } = useAuthStore()

  return (
    <aside className="flex flex-col w-56 min-h-screen bg-sidebar text-white">
      {/* ロゴ */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-white/10">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-bold text-white text-sm">
          TA
        </div>
        <div className="leading-tight">
          <div className="text-xs text-white/60">就業管理システム</div>
          <div className="text-sm font-semibold">【TA】</div>
        </div>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => {
          if (item.adminOnly && user?.role !== 'admin' && user?.role !== 'manager') return null
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                ${isActive
                  ? 'bg-primary text-white font-semibold border-l-4 border-primary-light'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'}`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* ログインユーザー情報 */}
      <div className="border-t border-white/10 px-4 py-3">
        <div className="text-xs text-white/50 mb-0.5">ログイン中</div>
        <div className="text-sm font-medium truncate">{user?.employee.name ?? '---'}</div>
        <div className="text-xs text-white/50 mb-2">{user?.employee.department_id}</div>
        <button
          onClick={logout}
          className="w-full text-xs text-white/60 hover:text-white py-1 rounded hover:bg-white/10 transition-colors"
        >
          ログアウト
        </button>
      </div>
    </aside>
  )
}
