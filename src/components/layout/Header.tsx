import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useEffect, useState } from 'react'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="flex items-center justify-between h-14 px-6 bg-white border-b border-gray-200 shrink-0">
      <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
      <div className="text-sm text-gray-500 tabular-nums">
        {format(now, 'yyyy年M月d日(E) HH:mm:ss', { locale: ja })}
      </div>
    </header>
  )
}
