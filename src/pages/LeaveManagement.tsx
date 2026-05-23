import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { LeaveRequest, LeaveBalance, LeaveType } from '@/types'

const LEAVE_TYPES: LeaveType[] = ['年次有給', '特別休暇', '誕生日休暇', 'リフレッシュ休暇', 'その他']
const STATUS_LABEL: Record<string, string> = {
  pending: '申請中',
  approved: '承認済',
  rejected: '却下',
  cancelled: 'キャンセル',
}
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
  cancelled: 'bg-gray-100 text-gray-500',
}

export default function LeaveManagement() {
  const { user } = useAuthStore()
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [balances, setBalances] = useState<LeaveBalance[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    if (!user) return
    const [{ data: r }, { data: b }] = await Promise.all([
      supabase
        .from('leave_requests')
        .select('*')
        .eq('employee_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('leave_balances')
        .select('*')
        .eq('employee_id', user.id)
        .eq('year', new Date().getFullYear()),
    ])
    setRequests(r ?? [])
    setBalances(b ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [user])

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 残日数 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {LEAVE_TYPES.filter((t) => t !== 'その他').map((type) => {
          const b = balances.find((b) => b.leave_type === type)
          return (
            <div key={type} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-xs text-gray-500 mb-1">{type}</div>
              <div className="text-xl font-bold text-gray-800">
                {b?.remaining_days ?? 0}
                <span className="text-sm font-normal text-gray-400 ml-1">日</span>
              </div>
              <div className="text-xs text-gray-400">
                使用 {b?.used_days ?? 0} / 付与 {b?.total_days ?? 0}
              </div>
            </div>
          )
        })}
      </div>

      {/* 申請ボタン */}
      <div className="flex justify-stretch sm:justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-5 py-2 rounded transition-colors"
        >
          + 休暇申請
        </button>
      </div>

      {/* 申請フォーム */}
      {showForm && (
        <LeaveRequestForm
          userId={user!.id}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchData() }}
        />
      )}

      {/* 申請一覧 */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-6 text-gray-400 text-center text-xs">読み込み中...</div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-6 text-gray-400 text-center text-xs">申請はありません</div>
        ) : (
          requests.map((r) => (
            <div key={r.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-800">{r.leave_type}</div>
                  <div className="text-xs text-gray-500 tabular-nums">{r.start_date} 〜 {r.end_date}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_COLOR[r.status]}`}>
                  {STATUS_LABEL[r.status]}
                </span>
              </div>
              <div className="text-sm text-gray-700">{r.days}日</div>
              <div className="text-sm text-gray-500">{r.reason || '理由未入力'}</div>
            </div>
          ))
        )}
      </div>

      <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">種別</th>
              <th className="px-4 py-3 text-left">期間</th>
              <th className="px-4 py-3 text-left">日数</th>
              <th className="px-4 py-3 text-left">理由</th>
              <th className="px-4 py-3 text-left">ステータス</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-gray-400 text-center text-xs">読み込み中...</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-gray-400 text-center text-xs">申請はありません</td></tr>
            ) : (
              requests.map((r) => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">{r.leave_type}</td>
                  <td className="px-4 py-3 tabular-nums">{r.start_date} 〜 {r.end_date}</td>
                  <td className="px-4 py-3">{r.days}日</td>
                  <td className="px-4 py-3 text-gray-500">{r.reason}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[r.status]}`}>
                      {STATUS_LABEL[r.status]}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---- 休暇申請フォーム ----
function LeaveRequestForm({
  userId,
  onClose,
  onSaved,
}: {
  userId: string
  onClose: () => void
  onSaved: () => void
}) {
  const [leaveType, setLeaveType] = useState<LeaveType>('年次有給')
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const calcDays = () => {
    const s = new Date(startDate)
    const e = new Date(endDate)
    return Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000) + 1)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await supabase.from('leave_requests').insert({
      employee_id: userId,
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      days: calcDays(),
      reason,
      status: 'pending',
    })
    setSaving(false)
    onSaved()
  }

  return (
    <div className="bg-white rounded-lg border border-primary p-4 sm:p-6">
      <h3 className="font-semibold text-gray-700 mb-4">休暇申請フォーム</h3>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">休暇種別</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as LeaveType)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              {LEAVE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">日数（自動計算）</label>
            <div className="text-sm font-bold text-gray-700 py-2">{calcDays()} 日</div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">開始日</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">終了日</label>
            <input
              type="date"
              required
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">申請理由</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-6 py-2 rounded"
          >
            {saving ? '送信中...' : '申請する'}
          </button>
          <button type="button" onClick={onClose} className="w-full sm:w-auto text-sm text-gray-500 hover:text-gray-700 px-4 py-2">
            キャンセル
          </button>
        </div>
      </form>
    </div>
  )
}
