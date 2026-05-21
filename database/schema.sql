-- ============================
-- 就業管理システム TA スキーマ
-- Supabase (PostgreSQL) 用
-- ============================

-- 部門
create table if not exists departments (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  parent_id   uuid references departments(id)
);

-- 従業員 (Supabase Auth の users と連携)
create table if not exists employees (
  id               uuid primary key references auth.users(id) on delete cascade,
  employee_code    text not null unique,
  name             text not null,
  email            text not null unique,
  department_id    uuid references departments(id),
  role             text not null check (role in ('admin','manager','employee')) default 'employee',
  employment_type  text not null check (employment_type in ('正社員','パート','アルバイト','派遣')) default '正社員',
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);

-- シフトマスタ
create table if not exists shifts (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  color          text not null default '#4A90D9',
  start_time     text not null,   -- HH:mm
  end_time       text not null,   -- HH:mm
  break_minutes  integer not null default 60
);

-- シフト割当
create table if not exists shift_assignments (
  id           uuid primary key default gen_random_uuid(),
  employee_id  uuid not null references employees(id) on delete cascade,
  shift_id     uuid not null references shifts(id) on delete cascade,
  date         date not null,
  note         text not null default '',
  unique(employee_id, date)
);

-- 勤怠記録
create table if not exists attendance_records (
  id                uuid primary key default gen_random_uuid(),
  employee_id       uuid not null references employees(id) on delete cascade,
  date              date not null,
  clock_in          timestamptz,
  clock_out         timestamptz,
  break_minutes     integer not null default 60,
  overtime_minutes  integer not null default 0,
  status            text not null check (status in ('present','absent','late','early_leave','holiday')) default 'present',
  note              text not null default '',
  is_modified       boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique(employee_id, date)
);

-- 休暇申請
create table if not exists leave_requests (
  id           uuid primary key default gen_random_uuid(),
  employee_id  uuid not null references employees(id) on delete cascade,
  leave_type   text not null check (leave_type in ('年次有給','特別休暇','誕生日休暇','リフレッシュ休暇','その他')),
  start_date   date not null,
  end_date     date not null,
  days         numeric(5,1) not null,
  reason       text not null default '',
  status       text not null check (status in ('pending','approved','rejected','cancelled')) default 'pending',
  approved_by  uuid references employees(id),
  created_at   timestamptz not null default now()
);

-- 休暇残日数
create table if not exists leave_balances (
  id             uuid primary key default gen_random_uuid(),
  employee_id    uuid not null references employees(id) on delete cascade,
  year           integer not null,
  leave_type     text not null,
  total_days     numeric(5,1) not null default 0,
  used_days      numeric(5,1) not null default 0,
  remaining_days numeric(5,1) generated always as (total_days - used_days) stored,
  unique(employee_id, year, leave_type)
);

-- 勤怠集計ビュー (月次サマリー)
-- 本番では集計処理 or マテリアライズドビューを推奨
create or replace view attendance_summaries as
select
  e.id                                          as employee_id,
  e.name                                        as employee_name,
  coalesce(d.name, '')                          as department,
  extract(year  from a.date)::int               as year,
  extract(month from a.date)::int               as month,
  count(*) filter (where a.status = 'present')  as work_days,
  count(*) filter (where a.status = 'absent')   as absent_days,
  count(*) filter (where a.status = 'late')     as late_count,
  count(*) filter (where a.status = 'early_leave') as early_leave_count,
  coalesce(sum(
    extract(epoch from (a.clock_out - a.clock_in))/60 - a.break_minutes
  ) filter (where a.clock_in is not null and a.clock_out is not null), 0)::int as total_work_minutes,
  coalesce(sum(a.overtime_minutes), 0)::int     as total_overtime_minutes,
  0                                             as total_holiday_work_minutes
from attendance_records a
join employees e on e.id = a.employee_id
left join departments d on d.id = e.department_id
group by e.id, e.name, d.name,
         extract(year from a.date),
         extract(month from a.date);

-- ============================
-- Row Level Security (RLS)
-- ============================

alter table employees          enable row level security;
alter table attendance_records enable row level security;
alter table leave_requests     enable row level security;
alter table leave_balances     enable row level security;
alter table shift_assignments  enable row level security;

-- 自分のレコードは参照・更新可能
create policy "自分の勤怠記録を参照" on attendance_records
  for select using (employee_id = auth.uid());

create policy "自分の勤怠記録を更新" on attendance_records
  for all using (employee_id = auth.uid());

-- 管理者・マネージャーは全レコード参照可能 (employee テーブルを参照)
create policy "管理者は全勤怠参照" on attendance_records
  for select using (
    exists (
      select 1 from employees
      where id = auth.uid() and role in ('admin','manager')
    )
  );

-- 同様のポリシーを leave_requests, leave_balances にも設定
create policy "自分の休暇申請を参照" on leave_requests
  for select using (employee_id = auth.uid());

create policy "管理者は全休暇申請参照" on leave_requests
  for select using (
    exists (select 1 from employees where id = auth.uid() and role in ('admin','manager'))
  );

create policy "管理者は休暇申請を更新" on leave_requests
  for update using (
    exists (select 1 from employees where id = auth.uid() and role in ('admin','manager'))
  );

create policy "自分の休暇残日数を参照" on leave_balances
  for select using (employee_id = auth.uid());

create policy "管理者は全休暇残日数参照" on leave_balances
  for select using (
    exists (select 1 from employees where id = auth.uid() and role in ('admin','manager'))
  );

-- ============================
-- サンプルデータ (任意)
-- ============================

insert into departments (id, name) values
  ('00000000-0000-0000-0000-000000000001', '総務部'),
  ('00000000-0000-0000-0000-000000000002', '営業部'),
  ('00000000-0000-0000-0000-000000000003', '開発部')
on conflict do nothing;

insert into shifts (name, color, start_time, end_time, break_minutes) values
  ('早番', '#E67E22', '08:00', '17:00', 60),
  ('日勤', '#2ECC71', '09:00', '18:00', 60),
  ('遅番', '#3498DB', '11:00', '20:00', 60),
  ('夜勤', '#9B59B6', '22:00', '07:00', 60)
on conflict do nothing;
