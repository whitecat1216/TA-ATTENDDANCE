import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text } from 'react-native'
import { useAuth } from '../auth/AuthProvider'
import { Card } from '../components/Card'
import { Screen } from '../components/Screen'
import { supabase } from '../lib/supabase'
import type { Department, Employee } from '../types'

const ROLE_LABEL: Record<string, string> = {
  admin: '管理者',
  manager: 'マネージャー',
  employee: '一般',
}

export function EmployeesScreen() {
  const { user } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const [{ data: employeeRows }, { data: departmentRows }] = await Promise.all([
      supabase.from('employees').select('*').order('name'),
      supabase.from('departments').select('*').order('name'),
    ])

    setEmployees(employeeRows ?? [])
    setDepartments(departmentRows ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  if (user?.role === 'employee') {
    return (
      <Screen title="従業員管理" subtitle="権限不足">
        <Card>
          <Text style={styles.emptyText}>この画面は管理者またはマネージャーのみ利用できます。</Text>
        </Card>
      </Screen>
    )
  }

  const departmentName = (departmentId: string) =>
    departments.find((item) => item.id === departmentId)?.name ?? departmentId

  return (
    <Screen title="従業員管理" subtitle="従業員一覧" refreshing={loading} onRefresh={load}>
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : (
        employees.map((employee) => (
          <Card key={employee.id}>
            <Text style={styles.code}>{employee.employee_code}</Text>
            <Text style={styles.name}>{employee.name}</Text>
            <Text style={styles.meta}>部門: {departmentName(employee.department_id)}</Text>
            <Text style={styles.meta}>雇用形態: {employee.employment_type}</Text>
            <Text style={styles.meta}>権限: {ROLE_LABEL[employee.role]}</Text>
            <Text style={[styles.status, employee.is_active ? styles.active : styles.inactive]}>
              {employee.is_active ? '在籍' : '退職'}
            </Text>
          </Card>
        ))
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
  code: {
    fontSize: 12,
    color: '#64748b',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  meta: {
    fontSize: 14,
    color: '#334155',
  },
  status: {
    fontSize: 13,
    fontWeight: '700',
  },
  active: {
    color: '#16a34a',
  },
  inactive: {
    color: '#94a3b8',
  },
})
