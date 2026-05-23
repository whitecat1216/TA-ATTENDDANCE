import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Employee, Department } from '@/types'

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState<Employee | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchData = async () => {
    const [{ data: e }, { data: d }] = await Promise.all([
      supabase.from('employees').select('*').order('name'),
      supabase.from('departments').select('*').order('name'),
    ])
    setEmployees(e ?? [])
    setDepartments(d ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const deptName = (id: string) => departments.find((d) => d.id === id)?.name ?? id

  const toggleActive = async (emp: Employee) => {
    await supabase.from('employees').update({ is_active: !emp.is_active }).eq('id', emp.id)
    fetchData()
  }

  const ROLE_LABEL: Record<string, string> = { admin: '管理者', manager: 'マネージャー', employee: '一般' }

  return (
    <div className="space-y-4">
      <div className="flex justify-stretch sm:justify-end">
        <button
          onClick={() => { setEditTarget(null); setShowForm(true) }}
          className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-5 py-2 rounded transition-colors"
        >
          + 従業員追加
        </button>
      </div>

      {showForm && (
        <EmployeeForm
          initial={editTarget}
          departments={departments}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchData() }}
        />
      )}

      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-8 text-center text-gray-400 text-xs">読み込み中...</div>
        ) : employees.map((emp) => (
          <div key={emp.id} className={`bg-white rounded-lg border border-gray-200 p-4 space-y-3 ${!emp.is_active ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-gray-500 font-mono">{emp.employee_code}</div>
                <div className="font-semibold text-gray-800">{emp.name}</div>
              </div>
              <span className={`text-xs ${emp.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                {emp.is_active ? '在籍' : '退職'}
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="col-span-2"><dt className="text-gray-500">部門</dt><dd>{deptName(emp.department_id)}</dd></div>
              <div><dt className="text-gray-500">雇用形態</dt><dd>{emp.employment_type}</dd></div>
              <div>
                <dt className="text-gray-500">権限</dt>
                <dd>
                  <span className={`text-xs px-2 py-0.5 rounded-full
                    ${emp.role === 'admin' ? 'bg-red-100 text-red-600' :
                      emp.role === 'manager' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                    {ROLE_LABEL[emp.role]}
                  </span>
                </dd>
              </div>
            </dl>
            <div className="flex gap-4 text-sm">
              <button
                onClick={() => { setEditTarget(emp); setShowForm(true) }}
                className="text-blue-600 hover:underline"
              >
                編集
              </button>
              <button
                onClick={() => toggleActive(emp)}
                className="text-gray-500 hover:underline"
              >
                {emp.is_active ? '無効化' : '有効化'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">社員番号</th>
              <th className="px-4 py-3 text-left">氏名</th>
              <th className="px-4 py-3 text-left">部門</th>
              <th className="px-4 py-3 text-left">雇用形態</th>
              <th className="px-4 py-3 text-left">権限</th>
              <th className="px-4 py-3 text-left">状態</th>
              <th className="px-4 py-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-xs">読み込み中...</td></tr>
            ) : employees.map((emp) => (
              <tr key={emp.id} className={`border-t border-gray-100 hover:bg-gray-50 ${!emp.is_active ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3 font-mono text-xs">{emp.employee_code}</td>
                <td className="px-4 py-3 font-medium">{emp.name}</td>
                <td className="px-4 py-3 text-gray-500">{deptName(emp.department_id)}</td>
                <td className="px-4 py-3">{emp.employment_type}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full
                    ${emp.role === 'admin' ? 'bg-red-100 text-red-600' :
                      emp.role === 'manager' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                    {ROLE_LABEL[emp.role]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs ${emp.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                    {emp.is_active ? '在籍' : '退職'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditTarget(emp); setShowForm(true) }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => toggleActive(emp)}
                      className="text-xs text-gray-500 hover:underline"
                    >
                      {emp.is_active ? '無効化' : '有効化'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---- 従業員フォーム ----
function EmployeeForm({
  initial,
  departments,
  onClose,
  onSaved,
}: {
  initial: Employee | null
  departments: Department[]
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    employee_code: initial?.employee_code ?? '',
    name: initial?.name ?? '',
    email: initial?.email ?? '',
    department_id: initial?.department_id ?? '',
    role: initial?.role ?? 'employee',
    employment_type: initial?.employment_type ?? '正社員',
  })
  const [saving, setSaving] = useState(false)

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    if (initial) {
      await supabase.from('employees').update(form).eq('id', initial.id)
    } else {
      await supabase.from('employees').insert({ ...form, is_active: true })
    }
    setSaving(false)
    onSaved()
  }

  return (
    <div className="bg-white rounded-lg border border-primary p-4 sm:p-6">
      <h3 className="font-semibold text-gray-700 mb-4">{initial ? '従業員編集' : '従業員追加'}</h3>
      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(['employee_code', 'name', 'email'] as const).map((k) => (
          <div key={k}>
            <label className="block text-xs text-gray-500 mb-1">
              {{ employee_code: '社員番号', name: '氏名', email: 'メールアドレス' }[k]}
            </label>
            <input
              required
              value={form[k]}
              onChange={(e) => set(k, e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
        ))}
        <div>
          <label className="block text-xs text-gray-500 mb-1">部門</label>
          <select value={form.department_id} onChange={(e) => set('department_id', e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
            <option value="">選択してください</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">権限</label>
          <select value={form.role} onChange={(e) => set('role', e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
            <option value="employee">一般</option>
            <option value="manager">マネージャー</option>
            <option value="admin">管理者</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">雇用形態</label>
          <select value={form.employment_type} onChange={(e) => set('employment_type', e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
            {['正社員', 'パート', 'アルバイト', '派遣'].map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3">
          <button type="submit" disabled={saving} className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-6 py-2 rounded">
            {saving ? '保存中...' : '保存'}
          </button>
          <button type="button" onClick={onClose} className="w-full sm:w-auto text-sm text-gray-500 hover:text-gray-700 px-4 py-2">
            キャンセル
          </button>
        </div>
      </form>
    </div>
  )
}
