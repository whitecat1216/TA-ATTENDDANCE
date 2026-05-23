-- ============================
-- 就業管理システム TA シードデータ
-- Supabase local seed
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
