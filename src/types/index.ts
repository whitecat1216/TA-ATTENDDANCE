// =====================
// 共通型定義
// =====================

export type Role = 'admin' | 'manager' | 'employee'

export interface Employee {
  id: string
  employee_code: string
  name: string
  email: string
  department_id: string
  role: Role
  employment_type: '正社員' | 'パート' | 'アルバイト' | '派遣'
  is_active: boolean
  created_at: string
}

export interface Department {
  id: string
  name: string
  parent_id: string | null
}

// 打刻
export interface AttendanceRecord {
  id: string
  employee_id: string
  date: string          // YYYY-MM-DD
  clock_in: string | null   // ISO datetime
  clock_out: string | null
  break_minutes: number
  overtime_minutes: number
  status: 'present' | 'absent' | 'late' | 'early_leave' | 'holiday'
  note: string
  is_modified: boolean  // 修正済フラグ（色表示用）
  created_at: string
  updated_at: string
}

// シフト
export interface Shift {
  id: string
  name: string
  color: string         // HEX カラーコード
  start_time: string    // HH:mm
  end_time: string      // HH:mm
  break_minutes: number
}

export interface ShiftAssignment {
  id: string
  employee_id: string
  shift_id: string
  date: string
  note: string
}

// 休暇
export type LeaveType = '年次有給' | '特別休暇' | '誕生日休暇' | 'リフレッシュ休暇' | 'その他'
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface LeaveRequest {
  id: string
  employee_id: string
  leave_type: LeaveType
  start_date: string
  end_date: string
  days: number
  reason: string
  status: LeaveStatus
  approved_by: string | null
  created_at: string
}

export interface LeaveBalance {
  employee_id: string
  year: number
  leave_type: LeaveType
  total_days: number
  used_days: number
  remaining_days: number
}

// 勤怠集計
export interface AttendanceSummary {
  employee_id: string
  employee_name: string
  department: string
  year: number
  month: number
  work_days: number
  absent_days: number
  late_count: number
  early_leave_count: number
  total_work_minutes: number
  total_overtime_minutes: number
  total_holiday_work_minutes: number
}

// ログインユーザー
export interface AuthUser {
  id: string
  employee: Employee
  role: Role
}
