import { useEffect, useState } from 'react'
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const title = pageTitles[pathname] ?? '就業管理システム TA'

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-gray-900/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="メニューを閉じる"
        />
      )}
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
