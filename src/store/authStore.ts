import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { AuthUser } from '@/types'

const MOCK_USERNAME = 'admin'
const MOCK_PASSWORD = 'password'
export const MOCK_USER_STORAGE_KEY = 'ta_mock_auth_user'

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
  } = await supabase.auth.getSession()

  if (!session) return null

  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return employee ? { id: session.user.id, employee, role: employee.role } : null
}

interface AuthState {
  user: AuthUser | null
  isMockUser: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isMockUser: false,
  loading: true,

  fetchSession: async () => {
    set({ loading: true })
    try {
      const mockAuth = localStorage.getItem(MOCK_USER_STORAGE_KEY)
      if (mockAuth) {
        set({ user: createMockAdminUser(), isMockUser: true, loading: false })
        return
      }

      const user = await getUserFromSession()
      set({ user, isMockUser: false, loading: false })
    } catch {
      set({ user: null, isMockUser: false, loading: false })
    }
  },

  login: async (identifier, password) => {
    if (identifier === MOCK_USERNAME && password === MOCK_PASSWORD) {
      localStorage.setItem(MOCK_USER_STORAGE_KEY, '1')
      set({ user: createMockAdminUser(), isMockUser: true })
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email: identifier, password })
    if (error) throw error

    const user = await getUserFromSession()
    if (!user) {
      throw new Error('ログインユーザーの従業員情報が見つかりません。employees テーブルを確認してください。')
    }

    set({ user, isMockUser: false })
  },

  logout: async () => {
    localStorage.removeItem(MOCK_USER_STORAGE_KEY)
    await supabase.auth.signOut()
    set({ user: null, isMockUser: false })
  },
}))
