import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../auth/AuthProvider'
import { Card } from '../components/Card'
import { Screen } from '../components/Screen'
import { supabase } from '../lib/supabase'
import type { AttendanceSummary } from '../types'

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View style={[styles.statCard, accent ? { backgroundColor: accent } : undefined]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  )
}

export function DashboardScreen() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<AttendanceSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const load = async () => {
    if (!user) return

    setLoading(true)
    const { data } = await supabase
      .from('attendance_summaries')
      .select('*')
      .eq('employee_id', user.id)
      .eq('year', year)
      .eq('month', month)
      .single()

    setSummary(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [user])

  const totalWorkHours = summary ? Math.floor(summary.total_work_minutes / 60) : 0
  const overtimeHours = summary ? Math.floor(summary.total_overtime_minutes / 60) : 0

  return (
    <Screen
      title="ダッシュボード"
      subtitle={`${year}年${month}月の勤怠状況`}
      refreshing={loading}
      onRefresh={load}
    >
      <Card>
        <Text style={styles.userName}>{user?.employee.name ?? '---'} さん</Text>
        <Text style={styles.userMeta}>
          権限: {user?.role ?? '---'} / 部門: {user?.employee.department_id || '未設定'}
        </Text>
      </Card>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : (
        <View style={styles.statGrid}>
          <StatCard label="出勤日数" value={`${summary?.work_days ?? 0}日`} />
          <StatCard label="欠勤日数" value={`${summary?.absent_days ?? 0}日`} accent="#fef2f2" />
          <StatCard label="遅刻回数" value={`${summary?.late_count ?? 0}回`} accent="#fefce8" />
          <StatCard label="早退回数" value={`${summary?.early_leave_count ?? 0}回`} accent="#fefce8" />
          <StatCard label="総労働時間" value={`${totalWorkHours}h`} />
          <StatCard label="残業時間" value={`${overtimeHours}h`} accent="#fff7ed" />
        </View>
      )}

      <Card>
        <Text style={styles.sectionTitle}>お知らせ</Text>
        <Text style={styles.muted}>現在お知らせはありません。</Text>
      </Card>
    </Screen>
  )
}

const styles = StyleSheet.create({
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  userMeta: {
    fontSize: 13,
    color: '#64748b',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47%',
    minWidth: 150,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  muted: {
    fontSize: 14,
    color: '#64748b',
  },
})
