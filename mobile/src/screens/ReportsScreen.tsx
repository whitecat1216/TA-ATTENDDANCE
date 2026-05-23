import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import { useState } from 'react'
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { Card } from '../components/Card'
import { Screen } from '../components/Screen'
import { supabase } from '../lib/supabase'
import type { AttendanceSummary } from '../types'

export function ReportsScreen() {
  const now = new Date()
  const [year] = useState(now.getFullYear())
  const [month] = useState(now.getMonth() + 1)
  const [preview, setPreview] = useState<AttendanceSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  const fetchPreview = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('attendance_summaries')
      .select('*')
      .eq('year', year)
      .eq('month', month)
      .order('department')
      .order('employee_name')

    setPreview(data ?? [])
    setLoading(false)
  }

  const exportCsv = async () => {
    setExporting(true)

    const rows = preview.length > 0 ? preview : await (async () => {
      const { data } = await supabase
        .from('attendance_summaries')
        .select('*')
        .eq('year', year)
        .eq('month', month)
        .order('department')
        .order('employee_name')

      return data ?? []
    })()

    const header = [
      '部門', '社員名', '年', '月', '出勤日数', '欠勤日数', '遅刻回数', '早退回数',
      '総労働時間(分)', '残業時間(分)', '休日労働時間(分)',
    ].join(',')

    const body = rows.map((row) => ([
      row.department,
      row.employee_name,
      row.year,
      row.month,
      row.work_days,
      row.absent_days,
      row.late_count,
      row.early_leave_count,
      row.total_work_minutes,
      row.total_overtime_minutes,
      row.total_holiday_work_minutes,
    ].join(',')))

    const fileUri = `${FileSystem.cacheDirectory}attendance-${year}-${month}.csv`
    const csv = `\uFEFF${[header, ...body].join('\n')}`

    await FileSystem.writeAsStringAsync(fileUri, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    })

    const canShare = await Sharing.isAvailableAsync()
    setExporting(false)

    if (!canShare) {
      Alert.alert('共有不可', `CSV を ${fileUri} に保存しました。`)
      return
    }

    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: '勤怠集計 CSV を共有',
    })
  }

  return (
    <Screen title="CSV 出力" subtitle={`${year}年${month}月の勤怠集計`}>
      <Card>
        <Text style={styles.description}>
          指定月の勤怠集計を CSV として共有できます。初回はプレビューを取得してください。
        </Text>
        <View style={styles.buttonGroup}>
          <Pressable style={styles.secondaryButton} onPress={fetchPreview} disabled={loading}>
            {loading ? <ActivityIndicator color="#1d4ed8" /> : <Text style={styles.secondaryButtonText}>プレビュー取得</Text>}
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={exportCsv} disabled={exporting}>
            {exporting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>CSV を共有</Text>}
          </Pressable>
        </View>
      </Card>

      {preview.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>プレビューはまだありません。</Text>
        </Card>
      ) : (
        preview.map((row) => (
          <Card key={`${row.employee_id}-${row.year}-${row.month}`}>
            <Text style={styles.department}>{row.department}</Text>
            <Text style={styles.employeeName}>{row.employee_name}</Text>
            <Text style={styles.metric}>出勤 {row.work_days} / 欠勤 {row.absent_days}</Text>
            <Text style={styles.metric}>総労働 {row.total_work_minutes}分 / 残業 {row.total_overtime_minutes}分</Text>
          </Card>
        ))
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  description: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  buttonGroup: {
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
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
  },
  metric: {
    fontSize: 14,
    color: '#334155',
  },
})
