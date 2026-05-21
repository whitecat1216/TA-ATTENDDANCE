import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { AttendanceRecord } from '@/types'

export default function TimeTracking() {
  const { user } = useAuthStore()
  const today = format(new Date(), 'yyyy-MM-dd')
  const [record, setRecord] = useState<AttendanceRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // 今日の打刻レコードを取得
  const fetchToday = async () => {
    if (!user) return
    const { data } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('employee_id', user.id)
      .eq('date', today)
      .single()
    setRecord(data ?? null)
    setLoading(false)
  }

  useEffect(() => { fetchToday() }, [user])

  // 出勤打刻
  const clockIn = async () => {
    if (!user) return
    setActionLoading(true)
    const { data, error } = await supabase
      .from('attendance_records')
      .upsert({
        employee_id: user.id,
        date: today,
        clock_in: new Date().toISOString(),
        status: 'present',
        break_minutes: 0,
        overtime_minutes: 0,
        is_modified: false,
        note: '',
      })
      .select()
      .single()
    if (!error) setRecord(data)
    setActionLoading(false)
  }

  // 退勤打刻
  const clockOut = async () => {
    if (!record) return
    setActionLoading(true)
    const { data, error } = await supabase
      .from('attendance_records')
      .update({ clock_out: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', record.id)
      .select()
      .single()
    if (!error) setRecord(data)
    setActionLoading(false)
  }

  const formatTime = (iso: string | null) =>
    iso ? format(parseISO(iso), 'HH:mm', { locale: ja }) : '--:--'

  return (
    <div className="max-w-2xl space-y-6">
      {/* 打刻カード */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-sm text-gray-500 mb-1">
          {format(new Date(), 'yyyy年M月d日(E)', { locale: ja })}
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-6">本日の打刻</h2>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">出勤時刻</div>
            <div className="text-4xl font-bold text-gray-800 tabular-nums">
              {loading ? '--:--' : formatTime(record?.clock_in ?? null)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">退勤時刻</div>
            <div className="text-4xl font-bold text-gray-800 tabular-nums">
              {loading ? '--:--' : formatTime(record?.clock_out ?? null)}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={clockIn}
            disabled={actionLoading || !!record?.clock_in}
            className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-40"
          >
            出勤
          </button>
          <button
            onClick={clockOut}
            disabled={actionLoading || !record?.clock_in || !!record?.clock_out}
            className="flex-1 bg-gray-700 hover:bg-gray-900 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-40"
          >
            退勤
          </button>
        </div>
      </div>

      {/* 修正フォーム */}
      <AttendanceEditForm record={record} onUpdated={setRecord} />
    </div>
  )
}

// ---- 打刻修正フォーム ----
function AttendanceEditForm({
  record,
  onUpdated,
}: {
  record: AttendanceRecord | null
  onUpdated: (r: AttendanceRecord) => void
}) {
  const [clockIn, setClockIn] = useState(record?.clock_in?.slice(11, 16) ?? '')
  const [clockOut, setClockOut] = useState(record?.clock_out?.slice(11, 16) ?? '')
  const [note, setNote] = useState(record?.note ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setClockIn(record?.clock_in?.slice(11, 16) ?? '')
    setClockOut(record?.clock_out?.slice(11, 16) ?? '')
    setNote(record?.note ?? '')
  }, [record])

  if (!record) return null

  const save = async () => {
    setSaving(true)
    const date = record.date
    const toISO = (t: string) => t ? `${date}T${t}:00+09:00` : null
    const { data, error } = await supabase
      .from('attendance_records')
      .update({
        clock_in: toISO(clockIn),
        clock_out: toISO(clockOut),
        note,
        is_modified: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', record.id)
      .select()
      .single()
    if (!error && data) onUpdated(data)
    setSaving(false)
  }

  return (
    <div className={`bg-white rounded-lg border p-6 ${record.is_modified ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}>
      <h3 className="font-semibold text-gray-700 mb-4 text-sm">
        打刻修正
        {record.is_modified && (
          <span className="ml-2 text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded">修正済</span>
        )}
      </h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">出勤時刻</label>
          <input
            type="time"
            value={clockIn}
            onChange={(e) => setClockIn(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">退勤時刻</label>
          <input
            type="time"
            value={clockOut}
            onChange={(e) => setClockOut(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-xs text-gray-500 mb-1">備考</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-6 py-2 rounded transition-colors disabled:opacity-50"
      >
        {saving ? '保存中...' : '保存'}
      </button>
    </div>
  )
}
