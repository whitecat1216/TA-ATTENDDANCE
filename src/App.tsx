import { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Layout } from '@/components/layout/Layout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import TimeTracking from '@/pages/TimeTracking'
import ShiftManagement from '@/pages/ShiftManagement'
import LeaveManagement from '@/pages/LeaveManagement'
import AttendanceSummary from '@/pages/AttendanceSummary'
import EmployeeManagement from '@/pages/EmployeeManagement'
import Reports from '@/pages/Reports'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">読み込み中...</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const { user, loading, fetchSession } = useAuthStore()

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/login"
          element={
            loading
              ? <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">読み込み中...</div>
              : user
                ? <Navigate to="/" replace />
                : <Login />
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="time-tracking" element={<TimeTracking />} />
          <Route path="shift" element={<ShiftManagement />} />
          <Route path="leave" element={<LeaveManagement />} />
          <Route path="summary" element={<AttendanceSummary />} />
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
