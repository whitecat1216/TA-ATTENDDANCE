import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../auth/AuthProvider'
import { Card } from '../components/Card'
import { Screen } from '../components/Screen'
import { supabase } from '../lib/supabase'
import type { AttendanceSummary } from '../types'

export function SummaryScreen() {
  const { user } = useAuth()
  const now = new Date()
  const [year] = useState(now.getFullYear())
  const [month] = useState(now.getMonth() + 1)
  const [rows, setRows] = useState<AttendanceSummary[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)

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
  }

  useEffect(() => {
    load()
  }, [user])

  const fmtHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const remain = minutes % 60
    return `${hours}h${remain > 0 ? `${remain}m` : ''}`
  }

  return (
    <Screen
      title="勤怠集計"
      subtitle={`${year}年${month}月`}
      refreshing={loading}
      onRefresh={load}
    >
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : rows.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>データがありません。</Text>
        </Card>
      ) : (
        rows.map((row) => (
          <Card key={`${row.employee_id}-${row.year}-${row.month}`}>
            <View>
              <Text style={styles.department}>{row.department}</Text>
              <Text style={styles.employeeName}>{row.employee_name}</Text>
            </View>
            <View style={styles.metricGrid}>
              <Metric label="出勤" value={`${row.work_days}`} />
              <Metric label="欠勤" value={`${row.absent_days}`} />
              <Metric label="遅刻" value={`${row.late_count}`} />
              <Metric label="早退" value={`${row.early_leave_count}`} />
              <Metric label="総労働" value={fmtHours(row.total_work_minutes)} />
              <Metric label="残業" value={fmtHours(row.total_overtime_minutes)} />
            </View>
            <Text style={styles.holiday}>休日労働: {fmtHours(row.total_holiday_work_minutes)}</Text>
          </Card>
        ))
      )}
    </Screen>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricBox}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
  department: {
    fontSize: 12,
    color: '#64748b',
  },
  employeeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 4,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricBox: {
    width: '47%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    gap: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  holiday: {
    fontSize: 13,
    color: '#334155',
  },
})
