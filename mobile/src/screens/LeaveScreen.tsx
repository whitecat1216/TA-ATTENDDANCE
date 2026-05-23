import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useAuth } from '../auth/AuthProvider'
import { Card } from '../components/Card'
import { Screen } from '../components/Screen'
import { supabase } from '../lib/supabase'
import type { LeaveBalance, LeaveRequest, LeaveType } from '../types'

const LEAVE_TYPES: LeaveType[] = ['年次有給', '特別休暇', '誕生日休暇', 'リフレッシュ休暇', 'その他']

const STATUS_LABEL: Record<string, string> = {
  pending: '申請中',
  approved: '承認済',
  rejected: '却下',
  cancelled: 'キャンセル',
}

export function LeaveScreen() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [balances, setBalances] = useState<LeaveBalance[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [leaveType, setLeaveType] = useState<LeaveType>('年次有給')
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [reason, setReason] = useState('')

  const load = async () => {
    if (!user) return

    setLoading(true)
    const [{ data: requestRows }, { data: balanceRows }] = await Promise.all([
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

    setRequests(requestRows ?? [])
    setBalances(balanceRows ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [user])

  const calcDays = () => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1)
  }

  const submit = async () => {
    if (!user) return

    setSaving(true)
    const { error } = await supabase.from('leave_requests').insert({
      employee_id: user.id,
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      days: calcDays(),
      reason,
      status: 'pending',
    })
    setSaving(false)

    if (error) {
      Alert.alert('休暇申請失敗', error.message)
      return
    }

    setShowForm(false)
    setReason('')
    await load()
  }

  return (
    <Screen title="休暇" subtitle="残日数と申請一覧" refreshing={loading} onRefresh={load}>
      <View style={styles.balanceGrid}>
        {LEAVE_TYPES.filter((item) => item !== 'その他').map((type) => {
          const balance = balances.find((item) => item.leave_type === type)
          return (
            <Card key={type}>
              <Text style={styles.balanceLabel}>{type}</Text>
              <Text style={styles.balanceValue}>{balance?.remaining_days ?? 0}日</Text>
              <Text style={styles.balanceSub}>使用 {balance?.used_days ?? 0} / 付与 {balance?.total_days ?? 0}</Text>
            </Card>
          )
        })}
      </View>

      <Pressable style={styles.primaryButton} onPress={() => setShowForm((value) => !value)}>
        <Text style={styles.primaryButtonText}>{showForm ? '申請フォームを閉じる' : '休暇申請を作成'}</Text>
      </Pressable>

      {showForm ? (
        <Card>
          <Text style={styles.sectionTitle}>休暇申請フォーム</Text>
          <View style={styles.chipRow}>
            {LEAVE_TYPES.map((type) => (
              <Pressable
                key={type}
                style={[styles.chip, leaveType === type && styles.chipActive]}
                onPress={() => setLeaveType(type)}
              >
                <Text style={[styles.chipText, leaveType === type && styles.chipTextActive]}>{type}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>開始日</Text>
            <TextInput value={startDate} onChangeText={setStartDate} placeholder="2026-05-22" style={styles.input} />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>終了日</Text>
            <TextInput value={endDate} onChangeText={setEndDate} placeholder="2026-05-22" style={styles.input} />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>日数</Text>
            <Text style={styles.daysText}>{calcDays()}日</Text>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>理由</Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="申請理由を入力"
              multiline
              style={[styles.input, styles.multilineInput]}
            />
          </View>
          <Pressable style={styles.primaryButton} onPress={submit} disabled={saving}>
            {saving ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>申請する</Text>}
          </Pressable>
        </Card>
      ) : null}

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : requests.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>申請はありません。</Text>
        </Card>
      ) : (
        requests.map((request) => (
          <Card key={request.id}>
            <View style={styles.requestHeader}>
              <View>
                <Text style={styles.requestTitle}>{request.leave_type}</Text>
                <Text style={styles.requestPeriod}>{request.start_date} 〜 {request.end_date}</Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{STATUS_LABEL[request.status]}</Text>
              </View>
            </View>
            <Text style={styles.requestBody}>{request.days}日 / {request.reason || '理由未入力'}</Text>
          </Card>
        ))
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  balanceGrid: {
    gap: 12,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  balanceSub: {
    fontSize: 12,
    color: '#64748b',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  chipText: {
    fontSize: 13,
    color: '#475569',
  },
  chipTextActive: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  daysText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  requestPeriod: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  requestBody: {
    fontSize: 14,
    color: '#475569',
  },
  statusPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#fef3c7',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '700',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
})
