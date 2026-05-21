import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

const pageTitles: Record<string, string> = {
  '/':              'ダッシュボード',
  '/time-tracking': '打刻・勤怠入力',
  '/shift':         'シフト管理',
  '/leave':         '休暇管理',
  '/summary':       '勤怠集計照会',
  '/employees':     '従業員管理',
  '/reports':       'CSVエクスポート',
}

export function Layout() {
  const { pathname } = useLocation()
  const title = pageTitles[pathname] ?? '就業管理システム TA'

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
