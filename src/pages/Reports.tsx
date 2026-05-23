import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { AttendanceSummary } from '@/types'

export default function Reports() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [exporting, setExporting] = useState(false)
  const [preview, setPreview] = useState<AttendanceSummary[]>([])
  const [loaded, setLoaded] = useState(false)

  const fetchPreview = async () => {
    setLoaded(false)
    const { data } = await supabase
      .from('attendance_summaries')
      .select('*')
      .eq('year', year)
      .eq('month', month)
      .order('department')
      .order('employee_name')
    setPreview(data ?? [])
    setLoaded(true)
  }

  const exportCSV = async () => {
    setExporting(true)
    const rows = preview.length > 0 ? preview : (await fetchData())

    const header = [
      '部門', '社員名', '年', '月', '出勤日数', '欠勤日数', '遅刻回数', '早退回数',
      '総労働時間(分)', '残業時間(分)', '休日労働時間(分)',
    ].join(',')

    const body = rows.map((r) =>
      [
        r.department, r.employee_name, r.year, r.month,
        r.work_days, r.absent_days, r.late_count, r.early_leave_count,
        r.total_work_minutes, r.total_overtime_minutes, r.total_holiday_work_minutes,
      ].join(',')
    )

    const csv = '\uFEFF' + [header, ...body].join('\n') // BOM付きUTF-8
    const defaultName = `勤怠集計_${year}年${month}月.csv`

    // Electron環境ではダイアログ、それ以外はダウンロード
    const api = (window as unknown as { electronAPI?: { showSaveDialog: (n: string) => Promise<{ canceled: boolean; filePath?: string }> } }).electronAPI
    if (api) {
      const { canceled, filePath } = await api.showSaveDialog(defaultName)
      if (!canceled && filePath) {
        // Node.js fs は preload 経由では使えないため、Blob ダウンロードにフォールバック
        downloadBlob(csv, defaultName)
      }
    } else {
      downloadBlob(csv, defaultName)
    }

    setExporting(false)
  }

  const fetchData = async (): Promise<AttendanceSummary[]> => {
    const { data } = await supabase
      .from('attendance_summaries')
      .select('*')
      .eq('year', year)
      .eq('month', month)
      .order('department')
      .order('employee_name')
    return data ?? []
  }

  const downloadBlob = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 space-y-4">
        <h2 className="font-semibold text-gray-700">勤怠集計 CSVエクスポート</h2>
        <p className="text-xs text-gray-500">
          指定月の勤怠集計データをCSV形式で出力します。給与システムへのインポートにご利用ください。
        </p>

        <div className="flex flex-col sm:flex-row sm:items-end gap-4 flex-wrap">
          <div>
            <label className="block text-xs text-gray-500 mb-1">年</label>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="border border-gray-300 rounded px-3 py-2 text-sm">
              {[now.getFullYear() - 1, now.getFullYear()].map((y) => (
                <option key={y} value={y}>{y}年</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">月</label>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="border border-gray-300 rounded px-3 py-2 text-sm">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{m}月</option>
              ))}
            </select>
          </div>
          <button onClick={fetchPreview} className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
            プレビュー
          </button>
          <button
            onClick={exportCSV}
            disabled={exporting}
            className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-5 py-2 rounded transition-colors disabled:opacity-50"
          >
            {exporting ? 'エクスポート中...' : 'CSVダウンロード'}
          </button>
        </div>
      </div>

      {/* プレビュー */}
      {loaded && (
        <>
          <div className="md:hidden space-y-3">
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 text-xs text-gray-500">
              {year}年{month}月 — {preview.length}件
            </div>
            {preview.map((r) => (
              <div key={`${r.employee_id}-${r.year}-${r.month}`} className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                <div>
                  <div className="text-xs text-gray-500">{r.department}</div>
                  <div className="font-semibold text-gray-800">{r.employee_name}</div>
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div><dt className="text-gray-500">出勤</dt><dd>{r.work_days}</dd></div>
                  <div><dt className="text-gray-500">欠勤</dt><dd>{r.absent_days}</dd></div>
                  <div><dt className="text-gray-500">総労働(分)</dt><dd className="tabular-nums">{r.total_work_minutes}</dd></div>
                  <div><dt className="text-gray-500">残業(分)</dt><dd className="tabular-nums">{r.total_overtime_minutes}</dd></div>
                </dl>
              </div>
            ))}
          </div>

          <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <div className="px-4 py-3 border-b border-gray-200 text-xs text-gray-500">
              {year}年{month}月 — {preview.length}件
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-2 text-left">部門</th>
                  <th className="px-4 py-2 text-left">氏名</th>
                  <th className="px-4 py-2 text-right">出勤</th>
                  <th className="px-4 py-2 text-right">欠勤</th>
                  <th className="px-4 py-2 text-right">総労働(分)</th>
                  <th className="px-4 py-2 text-right">残業(分)</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((r) => (
                  <tr key={`${r.employee_id}-${r.year}-${r.month}`} className="border-t border-gray-100">
                    <td className="px-4 py-2 text-gray-500">{r.department}</td>
                    <td className="px-4 py-2">{r.employee_name}</td>
                    <td className="px-4 py-2 text-right">{r.work_days}</td>
                    <td className="px-4 py-2 text-right">{r.absent_days}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{r.total_work_minutes}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{r.total_overtime_minutes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
