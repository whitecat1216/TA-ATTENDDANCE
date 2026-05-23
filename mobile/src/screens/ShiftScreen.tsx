import { addMonths, endOfMonth, format, startOfMonth } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../auth/AuthProvider'
import { Card } from '../components/Card'
import { Screen } from '../components/Screen'
import { supabase } from '../lib/supabase'
import type { Shift, ShiftAssignment } from '../types'

export function ShiftScreen() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [shifts, setShifts] = useState<Shift[]>([])
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!user) return

    setLoading(true)
    const start = format(startOfMonth(currentDate), 'yyyy-MM-dd')
    const end = format(endOfMonth(currentDate), 'yyyy-MM-dd')

    const [{ data: shiftRows }, { data: assignmentRows }] = await Promise.all([
      supabase.from('shifts').select('*').order('name'),
      supabase
        .from('shift_assignments')
        .select('*')
        .eq('employee_id', user.id)
        .gte('date', start)
        .lte('date', end)
        .order('date'),
    ])

    setShifts(shiftRows ?? [])
    setAssignments(assignmentRows ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [currentDate, user])

  const getShift = (shiftId: string) => shifts.find((item) => item.id === shiftId)

  return (
    <Screen
      title="シフト"
      subtitle="今月のシフト一覧"
      refreshing={loading}
      onRefresh={load}
    >
      <Card>
        <View style={styles.monthHeader}>
          <Pressable onPress={() => setCurrentDate((value) => addMonths(value, -1))} style={styles.arrowButton}>
            <Text style={styles.arrowText}>◀</Text>
          </Pressable>
          <Text style={styles.monthText}>{format(currentDate, 'yyyy年M月', { locale: ja })}</Text>
          <Pressable onPress={() => setCurrentDate((value) => addMonths(value, 1))} style={styles.arrowButton}>
            <Text style={styles.arrowText}>▶</Text>
          </Pressable>
        </View>
      </Card>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : assignments.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>この月のシフトはありません。</Text>
        </Card>
      ) : (
        assignments.map((assignment) => {
          const shift = getShift(assignment.shift_id)
          return (
            <Card key={assignment.id}>
              <Text style={styles.dateText}>{assignment.date}</Text>
              <Text style={styles.shiftName}>{shift?.name ?? '未設定シフト'}</Text>
              <Text style={styles.shiftTime}>
                {shift ? `${shift.start_time} 〜 ${shift.end_time}` : '時刻未設定'}
              </Text>
              {assignment.note ? <Text style={styles.noteText}>{assignment.note}</Text> : null}
            </Card>
          )
        })
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#eff6ff',
  },
  arrowText: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
  dateText: {
    fontSize: 13,
    color: '#64748b',
  },
  shiftName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  shiftTime: {
    fontSize: 14,
    color: '#334155',
  },
  noteText: {
    fontSize: 13,
    color: '#64748b',
  },
})
