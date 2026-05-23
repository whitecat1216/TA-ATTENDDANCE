import { format, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'
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
import AsyncStorage from '@react-native-async-storage/async-storage'
import { MOCK_USER_STORAGE_KEY, useAuth } from '../auth/AuthProvider'
import { Card } from '../components/Card'
import { Screen } from '../components/Screen'
import { supabase } from '../lib/supabase'
import type { AttendanceRecord } from '../types'

const MOCK_ATTENDANCE_STORAGE_PREFIX = 'ta_mobile_mock_attendance_record:'

const createEmptyMockRecord = (employeeId: string, date: string): AttendanceRecord => {
  const now = new Date().toISOString()

  return {
    id: `mock-${employeeId}-${date}`,
    employee_id: employeeId,
    date,
    clock_in: null,
    clock_out: null,
    break_minutes: 0,
    overtime_minutes: 0,
    status: 'present',
    note: '',
    is_modified: false,
    created_at: now,
    updated_at: now,
  }
}

const getMockAttendanceStorageKey = (date: string) => `${MOCK_ATTENDANCE_STORAGE_PREFIX}${date}`

const loadMockRecord = async (date: string): Promise<AttendanceRecord | null> => {
  const raw = await AsyncStorage.getItem(getMockAttendanceStorageKey(date))
  if (!raw) return null

  try {
    return JSON.parse(raw) as AttendanceRecord
  } catch {
    await AsyncStorage.removeItem(getMockAttendanceStorageKey(date))
    return null
  }
}

const saveMockRecord = async (date: string, record: AttendanceRecord) => {
  await AsyncStorage.setItem(getMockAttendanceStorageKey(date), JSON.stringify(record))
}

const isMockSessionActive = async () => Boolean(await AsyncStorage.getItem(MOCK_USER_STORAGE_KEY))

export function TimeTrackingScreen() {
  const { user, isMockUser } = useAuth()
  const today = format(new Date(), 'yyyy-MM-dd')
  const [record, setRecord] = useState<AttendanceRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [clockInText, setClockInText] = useState('')
  const [clockOutText, setClockOutText] = useState('')
  const [note, setNote] = useState('')

  const syncForm = (nextRecord: AttendanceRecord | null) => {
    setClockInText(nextRecord?.clock_in?.slice(11, 16) ?? '')
    setClockOutText(nextRecord?.clock_out?.slice(11, 16) ?? '')
    setNote(nextRecord?.note ?? '')
  }

  const load = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)

    if (isMockUser || await isMockSessionActive()) {
      const nextRecord = await loadMockRecord(today)
      setRecord(nextRecord)
      syncForm(nextRecord)
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('employee_id', user.id)
      .eq('date', today)
      .single()

    const nextRecord = data ?? null
    setRecord(nextRecord)
    syncForm(nextRecord)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [user])

  const formatTime = (iso: string | null) =>
    iso ? format(parseISO(iso), 'HH:mm', { locale: ja }) : '--:--'

  const clockIn = async () => {
    if (!user) return

    if (isMockUser || await isMockSessionActive()) {
      setActionLoading(true)
      const nextRecord: AttendanceRecord = {
        ...(record ?? createEmptyMockRecord(user.id, today)),
        clock_in: new Date().toISOString(),
        status: 'present',
        updated_at: new Date().toISOString(),
      }
      await saveMockRecord(today, nextRecord)
      setActionLoading(false)
      setRecord(nextRecord)
      syncForm(nextRecord)
      return
    }

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

    setActionLoading(false)

    if (error) {
      Alert.alert('出勤打刻失敗', error.message)
      return
    }

    setRecord(data)
    syncForm(data)
  }

  const clockOut = async () => {
    if (!record) return

    if (isMockUser || await isMockSessionActive()) {
      setActionLoading(true)
      const nextRecord: AttendanceRecord = {
        ...record,
        clock_out: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      await saveMockRecord(today, nextRecord)
      setActionLoading(false)
      setRecord(nextRecord)
      syncForm(nextRecord)
      return
    }

    setActionLoading(true)
    const { data, error } = await supabase
      .from('attendance_records')
      .update({
        clock_out: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', record.id)
      .select()
      .single()

    setActionLoading(false)

    if (error) {
      Alert.alert('退勤打刻失敗', error.message)
      return
    }

    setRecord(data)
    syncForm(data)
  }

  const save = async () => {
    if (!record) return

    setActionLoading(true)
    const toISO = (value: string) => (value ? `${record.date}T${value}:00+09:00` : null)

    if (isMockUser || await isMockSessionActive()) {
      const nextRecord: AttendanceRecord = {
        ...record,
        clock_in: toISO(clockInText),
        clock_out: toISO(clockOutText),
        note,
        is_modified: true,
        updated_at: new Date().toISOString(),
      }
      await saveMockRecord(record.date, nextRecord)
      setActionLoading(false)
      setRecord(nextRecord)
      syncForm(nextRecord)
      Alert.alert('保存完了', '打刻修正を保存しました。')
      return
    }

    const { data, error } = await supabase
      .from('attendance_records')
      .update({
        clock_in: toISO(clockInText),
        clock_out: toISO(clockOutText),
        note,
        is_modified: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', record.id)
      .select()
      .single()

    setActionLoading(false)

    if (error) {
      Alert.alert('打刻修正失敗', error.message)
      return
    }

    setRecord(data)
    syncForm(data)
    Alert.alert('保存完了', '打刻修正を保存しました。')
  }

  return (
    <Screen
      title="打刻"
      subtitle={format(new Date(), 'yyyy年M月d日(E)', { locale: ja })}
      refreshing={loading}
      onRefresh={load}
    >
      <Card>
        <Text style={styles.sectionTitle}>本日の打刻</Text>
        <View style={styles.timeRow}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>出勤時刻</Text>
            <Text style={styles.timeValue}>{loading ? '--:--' : formatTime(record?.clock_in ?? null)}</Text>
          </View>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>退勤時刻</Text>
            <Text style={styles.timeValue}>{loading ? '--:--' : formatTime(record?.clock_out ?? null)}</Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.primaryButton, (actionLoading || !!record?.clock_in) && styles.buttonDisabled]}
            onPress={clockIn}
            disabled={actionLoading || !!record?.clock_in}
          >
            {actionLoading && !record?.clock_in ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>出勤</Text>
            )}
          </Pressable>

          <Pressable
            style={[styles.secondaryButton, (actionLoading || !record?.clock_in || !!record?.clock_out) && styles.buttonDisabled]}
            onPress={clockOut}
            disabled={actionLoading || !record?.clock_in || !!record?.clock_out}
          >
            {actionLoading && !!record?.clock_in && !record?.clock_out ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.secondaryButtonText}>退勤</Text>
            )}
          </Pressable>
        </View>
      </Card>

      {record ? (
        <Card>
          <Text style={styles.sectionTitle}>打刻修正</Text>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>出勤時刻（HH:mm）</Text>
            <TextInput value={clockInText} onChangeText={setClockInText} placeholder="09:00" style={styles.input} />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>退勤時刻（HH:mm）</Text>
            <TextInput value={clockOutText} onChangeText={setClockOutText} placeholder="18:00" style={styles.input} />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>備考</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="備考を入力"
              style={[styles.input, styles.multilineInput]}
              multiline
            />
          </View>
          <Pressable style={styles.primaryButton} onPress={save} disabled={actionLoading}>
            <Text style={styles.primaryButtonText}>修正を保存</Text>
          </Pressable>
        </Card>
      ) : (
        <Card>
          <Text style={styles.muted}>まだ本日の打刻データはありません。出勤ボタンを押してください。</Text>
        </Card>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeBlock: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 12,
    gap: 6,
  },
  timeLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  timeValue: {
    fontSize: 30,
    fontWeight: '700',
    color: '#0f172a',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
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
  muted: {
    color: '#64748b',
    fontSize: 14,
  },
})
