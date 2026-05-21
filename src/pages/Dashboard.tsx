import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { AttendanceSummary } from '@/types'

interface StatCard {
  label: string
  value: string | number
  sub?: string
  color?: string
}

function StatCard({ label, value, sub, color = 'bg-white' }: StatCard) {
  return (
    <div className={`${color} rounded-lg shadow-sm border border-gray-200 p-5`}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const [summary, setSummary] = useState<AttendanceSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const { data } = await supabase
        .from('attendance_summaries')
        .select('*')
        .eq('employee_id', user.id)
        .eq('year', year)
        .eq('month', month)
        .single()
      setSummary(data)
      setLoading(false)
    })()
  }, [user, year, month])

  const totalWorkHours = summary
    ? Math.floor(summary.total_work_minutes / 60)
    : 0
  const overtimeHours = summary
    ? Math.floor(summary.total_overtime_minutes / 60)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base text-gray-500">
          {year}年{month}月 — {user?.employee.name} さんの勤怠状況
        </h2>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">読み込み中...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard label="出勤日数"        value={`${summary?.work_days ?? 0}日`} />
          <StatCard label="欠勤日数"        value={`${summary?.absent_days ?? 0}日`} color="bg-red-50" />
          <StatCard label="遅刻回数"        value={`${summary?.late_count ?? 0}回`} color="bg-yellow-50" />
          <StatCard label="早退回数"        value={`${summary?.early_leave_count ?? 0}回`} color="bg-yellow-50" />
          <StatCard label="総労働時間"      value={`${totalWorkHours}h`} />
          <StatCard label="残業時間"        value={`${overtimeHours}h`} color="bg-orange-50" />
        </div>
      )}

      {/* お知らせエリア（将来的に通知を表示） */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-700 mb-3 text-sm">お知らせ</h3>
        <p className="text-gray-400 text-sm">現在お知らせはありません。</p>
      </div>
    </div>
  )
}
