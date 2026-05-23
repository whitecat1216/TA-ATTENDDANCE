import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { AttendanceSummary } from '@/types'

export default function AttendanceSummaryPage() {
  const { user } = useAuthStore()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [rows, setRows] = useState<AttendanceSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      // 管理者は全員、一般は自分のみ
      let query = supabase
        .from('attendance_summaries')
        .select('*')
        .eq('year', year)
        .eq('month', month)
        .order('department')
        .order('employee_name')

      if (user?.role === 'employee') {
        query = query.eq('employee_id', user.id)
      }

      const { data } = await query
      setRows(data ?? [])
      setLoading(false)
    })()
  }, [year, month, user])

  const fmtHours = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h}h${m > 0 ? m + 'm' : ''}`
  }

  return (
    <div className="space-y-4">
      {/* 月選択 */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm"
        >
          {[now.getFullYear() - 1, now.getFullYear()].map((y) => (
            <option key={y} value={y}>{y}年</option>
          ))}
        </select>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>{m}月</option>
          ))}
        </select>
      </div>

      {/* 集計テーブル */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-8 text-center text-gray-400 text-xs">読み込み中...</div>
        ) : rows.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-8 text-center text-gray-400 text-xs">データがありません</div>
        ) : (
          rows.map((r) => (
            <div key={`${r.employee_id}-${r.year}-${r.month}`} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
              <div>
                <div className="text-xs text-gray-500">{r.department}</div>
                <div className="font-semibold text-gray-800">{r.employee_name}</div>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div><dt className="text-gray-500">出勤</dt><dd className="font-medium">{r.work_days}</dd></div>
                <div><dt className="text-gray-500">欠勤</dt><dd className={r.absent_days > 0 ? 'font-medium text-red-500' : 'font-medium'}>{r.absent_days}</dd></div>
                <div><dt className="text-gray-500">遅刻</dt><dd className={r.late_count > 0 ? 'font-medium text-yellow-600' : 'font-medium'}>{r.late_count}</dd></div>
                <div><dt className="text-gray-500">早退</dt><dd className={r.early_leave_count > 0 ? 'font-medium text-yellow-600' : 'font-medium'}>{r.early_leave_count}</dd></div>
                <div><dt className="text-gray-500">総労働</dt><dd className="font-medium">{fmtHours(r.total_work_minutes)}</dd></div>
                <div><dt className="text-gray-500">残業</dt><dd className={r.total_overtime_minutes > 0 ? 'font-medium text-orange-500' : 'font-medium'}>{fmtHours(r.total_overtime_minutes)}</dd></div>
                <div className="col-span-2"><dt className="text-gray-500">休日労働</dt><dd className="font-medium">{fmtHours(r.total_holiday_work_minutes)}</dd></div>
              </dl>
            </div>
          ))
        )}
      </div>

      <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">部門</th>
              <th className="px-4 py-3 text-left">氏名</th>
              <th className="px-4 py-3 text-right">出勤</th>
              <th className="px-4 py-3 text-right">欠勤</th>
              <th className="px-4 py-3 text-right">遅刻</th>
              <th className="px-4 py-3 text-right">早退</th>
              <th className="px-4 py-3 text-right">総労働</th>
              <th className="px-4 py-3 text-right">残業</th>
              <th className="px-4 py-3 text-right">休日労働</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400 text-xs">読み込み中...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400 text-xs">データがありません</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={`${r.employee_id}-${r.year}-${r.month}`} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{r.department}</td>
                  <td className="px-4 py-3 font-medium">{r.employee_name}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{r.work_days}</td>
                  <td className={`px-4 py-3 text-right tabular-nums ${r.absent_days > 0 ? 'text-red-500' : ''}`}>{r.absent_days}</td>
                  <td className={`px-4 py-3 text-right tabular-nums ${r.late_count > 0 ? 'text-yellow-600' : ''}`}>{r.late_count}</td>
                  <td className={`px-4 py-3 text-right tabular-nums ${r.early_leave_count > 0 ? 'text-yellow-600' : ''}`}>{r.early_leave_count}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmtHours(r.total_work_minutes)}</td>
                  <td className={`px-4 py-3 text-right tabular-nums ${r.total_overtime_minutes > 0 ? 'text-orange-500' : ''}`}>
                    {fmtHours(r.total_overtime_minutes)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmtHours(r.total_holiday_work_minutes)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
