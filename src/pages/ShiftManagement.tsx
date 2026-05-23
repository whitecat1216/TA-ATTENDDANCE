import { useEffect, useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { ja } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import type { Shift, ShiftAssignment, Employee } from '@/types'

export default function ShiftManagement() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [shifts, setShifts] = useState<Shift[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([])
  const [loading, setLoading] = useState(true)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1
  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  })

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const [{ data: s }, { data: e }, { data: a }] = await Promise.all([
        supabase.from('shifts').select('*').order('name'),
        supabase.from('employees').select('*').eq('is_active', true).order('name'),
        supabase
          .from('shift_assignments')
          .select('*')
          .gte('date', format(startOfMonth(currentDate), 'yyyy-MM-dd'))
          .lte('date', format(endOfMonth(currentDate), 'yyyy-MM-dd')),
      ])
      setShifts(s ?? [])
      setEmployees(e ?? [])
      setAssignments(a ?? [])
      setLoading(false)
    })()
  }, [year, month])

  const getAssignment = (employeeId: string, date: string) =>
    assignments.find((a) => a.employee_id === employeeId && a.date === date)

  const getShift = (shiftId: string) => shifts.find((s) => s.id === shiftId)

  const prevMonth = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const nextMonth = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="px-3 py-1 border rounded text-sm hover:bg-gray-50">◀</button>
          <h2 className="text-base font-semibold text-gray-700 min-w-[8rem] text-center">
            {format(currentDate, 'yyyy年M月', { locale: ja })}
          </h2>
          <button onClick={nextMonth} className="px-3 py-1 border rounded text-sm hover:bg-gray-50">▶</button>
        </div>
        <div className="text-xs text-gray-400">モバイルでは表を横スクロールして閲覧してください</div>
      </div>

      {/* シフト凡例 */}
      <div className="flex flex-wrap gap-2">
        {shifts.map((s) => (
          <div key={s.id} className="flex items-center gap-1 text-xs">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: s.color }} />
            <span>{s.name} ({s.start_time}〜{s.end_time})</span>
          </div>
        ))}
      </div>

      {/* シフト表 */}
      {loading ? (
        <p className="text-gray-400 text-sm">読み込み中...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
          <table className="w-full text-xs border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-3 py-2 sticky left-0 bg-gray-50 text-left min-w-[120px]">
                  氏名
                </th>
                {days.map((day) => (
                  <th
                    key={day.toISOString()}
                    className={`border border-gray-200 px-2 py-2 min-w-[40px] font-medium
                      ${day.getDay() === 0 ? 'text-red-500' : day.getDay() === 6 ? 'text-blue-500' : ''}`}
                  >
                    {format(day, 'd')}
                    <div className="font-normal text-gray-400">{format(day, 'E', { locale: ja })}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-3 py-1.5 sticky left-0 bg-white font-medium">
                    {emp.name}
                  </td>
                  {days.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd')
                    const assignment = getAssignment(emp.id, dateStr)
                    const shift = assignment ? getShift(assignment.shift_id) : null
                    return (
                      <td
                        key={dateStr}
                        className="border border-gray-200 px-1 py-1 text-center"
                        style={shift ? { backgroundColor: shift.color + '40' } : {}}
                      >
                        {shift ? (
                          <span style={{ color: shift.color }} className="font-semibold">
                            {shift.name}
                          </span>
                        ) : (
                          <span className="text-gray-300">―</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
