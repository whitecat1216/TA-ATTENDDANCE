import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { supabase } from '../lib/supabase'
import type { AuthUser } from '../types'

const MOCK_USERNAME = 'admin'
const MOCK_PASSWORD = 'password'
export const MOCK_USER_STORAGE_KEY = 'ta_mobile_mock_auth_user'

const createMockAdminUser = (): AuthUser => ({
  id: 'mock-admin-id',
  role: 'admin',
  employee: {
    id: 'mock-admin-id',
    employee_code: 'ADMIN001',
    name: 'admin',
    email: 'admin@local',
    department_id: '',
    role: 'admin',
    employment_type: '正社員',
    is_active: true,
    created_at: new Date().toISOString(),
  },
})

const getUserFromSession = async (): Promise<AuthUser | null> => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    throw sessionError
  }

  if (!session) return null

  const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (employeeError) {
    throw employeeError
  }

  return employee ? { id: session.user.id, employee, role: employee.role } : null
}

interface AuthContextValue {
  user: AuthUser | null
  isMockUser: boolean
  loading: boolean
  login: (identifier: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isMockUser, setIsMockUser] = useState(false)
  const [loading, setLoading] = useState(true)

  const refreshSession = async () => {
    setLoading(true)

    try {
      const mockAuth = await AsyncStorage.getItem(MOCK_USER_STORAGE_KEY)
      if (mockAuth) {
        setUser(createMockAdminUser())
        setIsMockUser(true)
        return
      }

      const nextUser = await getUserFromSession()
      setUser(nextUser)
      setIsMockUser(false)
    } catch (error) {
      console.error('モバイルセッション取得に失敗しました', error)
      setUser(null)
      setIsMockUser(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshSession()

    const subscription = supabase.auth.onAuthStateChange(async (_event, session) => {
      const mockAuth = await AsyncStorage.getItem(MOCK_USER_STORAGE_KEY)
      if (mockAuth) {
        setUser(createMockAdminUser())
        setIsMockUser(true)
        setLoading(false)
        return
      }

      if (!session) {
        setUser(null)
        setIsMockUser(false)
        setLoading(false)
        return
      }

      try {
        const nextUser = await getUserFromSession()
        setUser(nextUser)
        setIsMockUser(false)
      } catch (error) {
        console.error('認証状態更新に失敗しました', error)
        setUser(null)
        setIsMockUser(false)
      } finally {
        setLoading(false)
      }
    })

    return () => {
      subscription.data.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isMockUser,
    loading,
    refreshSession,
    login: async (identifier, password) => {
      if (identifier === MOCK_USERNAME && password === MOCK_PASSWORD) {
        await AsyncStorage.setItem(MOCK_USER_STORAGE_KEY, '1')
        setUser(createMockAdminUser())
        setIsMockUser(true)
        return
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      })

      if (error) {
        throw error
      }

      const nextUser = await getUserFromSession()
      if (!nextUser) {
        throw new Error('ログインユーザーの従業員情報が見つかりません。employees テーブルを確認してください。')
      }

      setUser(nextUser)
      setIsMockUser(false)
    },
    logout: async () => {
      await AsyncStorage.removeItem(MOCK_USER_STORAGE_KEY)
      await supabase.auth.signOut()
      setUser(null)
      setIsMockUser(false)
    },
  }), [isMockUser, loading, user])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth は AuthProvider の内側で使用してください')
  }

  return context
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
})
