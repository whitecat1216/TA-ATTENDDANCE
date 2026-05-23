import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useEffect, useState } from 'react'

interface HeaderProps {
  title: string
  onMenuClick?: () => void
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-white border-b border-gray-200 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50"
          aria-label="メニューを開く"
        >
          ☰
        </button>
        <h1 className="text-base sm:text-lg font-semibold text-gray-800 truncate">{title}</h1>
      </div>
      <div className="hidden sm:block text-sm text-gray-500 tabular-nums whitespace-nowrap">
        {format(now, 'yyyy年M月d日(E) HH:mm:ss', { locale: ja })}
      </div>
    </header>
  )
}
