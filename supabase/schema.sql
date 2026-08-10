-- ============================================================================
--  S.Well-Being — สคีมาเฟส 1: ระบบเคส (แจ้งเหตุ → แดชบอร์ดครู)
--
--  หลักการ: anon key ฝังอยู่ในหน้าเว็บที่ใครก็เปิดดูได้ ดังนั้น "ความปลอดภัย
--  ทั้งหมดอยู่ที่ RLS" — ทุกตารางเปิด RLS และไม่มี policy ใดให้สิทธิ์ผู้ที่ยัง
--  ไม่ได้ล็อกอิน (anon) แม้แต่แถวเดียว
--
--  วิธีใช้: คัดลอกทั้งไฟล์ไปวางใน Supabase → SQL Editor → Run
--  ปลอดภัยที่จะรันซ้ำ (idempotent)
-- ============================================================================

-- ---------- ชนิดข้อมูล ----------
do $$ begin
  create type staff_role as enum ('psychologist', 'counselor', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type case_status as enum ('pending', 'in_progress', 'resolved', 'followup');
exception when duplicate_object then null; end $$;

do $$ begin
  create type case_expectation as enum ('urgent', 'prepare');
exception when duplicate_object then null; end $$;

-- ============================================================================
--  ตาราง
-- ============================================================================

-- ---------- เจ้าหน้าที่: ทะเบียนครู ผูกตัวตนด้วยอีเมล Google ----------
create table if not exists public.staff (
  id          text primary key,
  email       text not null unique,
  name        text not null,
  role        staff_role not null,
  title       text not null default '',
  emoji       text not null default '🙂',
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------- โปรไฟล์นักเรียน: ผูกบัญชี Google กับข้อมูลโรงเรียน ----------
create table if not exists public.profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  username    text not null default '',
  student_id  text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- เคสที่ระบุตัวตน: นักเรียนขอให้ติดต่อกลับ ----------
create table if not exists public.cases (
  id              text primary key,                       -- รหัสติดตาม SWB-XXXXXX
  reporter        uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  category_id     text not null,
  category_label  text not null,
  expectation     case_expectation not null,
  sensitive       boolean not null default false,
  contact_name    text not null default '',
  contact_room    text not null default '',
  contact_phone   text not null default '',
  incident        text not null default '',
  victim          text not null default '',
  perpetrator     text not null default '',
  location_th     text,
  location_en     text,
  status          case_status not null default 'pending',
  note            text not null default '',
  assigned_to     text references public.staff(id) on delete set null,
  acknowledged_at timestamptz
);
create index if not exists cases_created_at_idx on public.cases (created_at desc);
create index if not exists cases_status_idx on public.cases (status);

-- ---------- รายงานแบบไม่ระบุตัวตน ----------
-- จงใจ "ไม่มี" คอลัมน์ผู้ส่งเลยแม้แต่คอลัมน์เดียว — ต่อให้ฐานข้อมูลรั่วทั้งก้อน
-- ก็สาวกลับไม่ได้ว่าใครแจ้ง นี่คือความเป็นนิรนามที่บังคับด้วยโครงสร้าง ไม่ใช่สัญญา
create table if not exists public.anon_reports (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  category_id     text not null,
  category_label  text not null,
  sensitive       boolean not null default false
);
create index if not exists anon_reports_created_at_idx on public.anon_reports (created_at desc);

-- ---------- บันทึกการเข้าถึงข้อมูล (พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล ม.37) ----------
-- เขียนเพิ่มได้อย่างเดียว: ไม่มี policy สำหรับ update/delete ⇒ ฐานข้อมูลปฏิเสธเอง
create table if not exists public.audit_log (
  id           uuid primary key default gen_random_uuid(),
  at           timestamptz not null default now(),
  actor        text not null,
  action       text not null,
  target_type  text not null,
  target_id    text not null,
  subject      text not null default '',
  detail       text
);
create index if not exists audit_log_at_idx on public.audit_log (at desc);

-- ============================================================================
--  ฟังก์ชันช่วยตัดสินสิทธิ์
-- ============================================================================

-- บทบาทของผู้ใช้ที่ล็อกอินอยู่ (null = ไม่ใช่เจ้าหน้าที่)
-- security definer เพื่ออ่านตาราง staff ได้โดยไม่วนกลับเข้า RLS ของตัวเอง
create or replace function public.current_staff_role()
returns staff_role
language sql
stable
security definer
set search_path = public
as $$
  select s.role
  from public.staff s
  where lower(s.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and s.active
  limit 1
$$;

-- เห็นข้อมูลนักเรียนรายบุคคลได้หรือไม่
-- ผู้ดูแลระบบ (admin) = ไม่ได้ โดยเจตนา ตามหลักเก็บข้อมูลเท่าที่จำเป็น (PDPA)
-- ตรงกับ canSeeStudentData() ฝั่งแอปทุกประการ
create or replace function public.can_see_student_data()
returns boolean
language sql
stable
set search_path = public
as $$
  select public.current_staff_role() in ('psychologist', 'counselor')
$$;

-- ============================================================================
--  เปิด RLS ทุกตาราง (ค่าเริ่มต้น = ปฏิเสธทุกอย่าง แล้วค่อยเปิดทีละช่อง)
-- ============================================================================
alter table public.staff        enable row level security;
alter table public.profiles     enable row level security;
alter table public.cases        enable row level security;
alter table public.anon_reports enable row level security;
alter table public.audit_log    enable row level security;

-- ---------- staff ----------
drop policy if exists staff_read on public.staff;
create policy staff_read on public.staff
  for select to authenticated
  using (true);                       -- ทะเบียนครู: ชื่อ/บทบาท ใช้ทำรายการให้เลือกนัดหมาย

drop policy if exists staff_write_admin on public.staff;
create policy staff_write_admin on public.staff
  for all to authenticated
  using (public.current_staff_role() = 'admin')
  with check (public.current_staff_role() = 'admin');

-- ---------- profiles: เจ้าของเท่านั้น ----------
drop policy if exists profiles_own on public.profiles;
create policy profiles_own on public.profiles
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------- cases ----------
-- นักเรียนเปิดเคสของตัวเองได้
drop policy if exists cases_insert_own on public.cases;
create policy cases_insert_own on public.cases
  for insert to authenticated
  with check (reporter = auth.uid());

-- นักเรียนดูได้เฉพาะเคสตัวเอง / ครูดูแลนักเรียนดูได้ทุกเคส / ผู้ดูแลระบบดูไม่ได้เลย
drop policy if exists cases_select on public.cases;
create policy cases_select on public.cases
  for select to authenticated
  using (reporter = auth.uid() or public.can_see_student_data());

-- แก้ไขเคส (สถานะ/บันทึก/ผู้รับผิดชอบ) เฉพาะครูที่ดูแลนักเรียน
drop policy if exists cases_update_staff on public.cases;
create policy cases_update_staff on public.cases
  for update to authenticated
  using (public.can_see_student_data())
  with check (public.can_see_student_data());
-- ไม่มี policy สำหรับ delete ⇒ ลบเคสไม่ได้จากฝั่งแอป

-- ---------- anon_reports ----------
drop policy if exists anon_reports_insert on public.anon_reports;
create policy anon_reports_insert on public.anon_reports
  for insert to authenticated
  with check (true);                  -- ไม่มีคอลัมน์ผู้ส่ง จึงไม่มีอะไรให้ตรวจ

drop policy if exists anon_reports_select_staff on public.anon_reports;
create policy anon_reports_select_staff on public.anon_reports
  for select to authenticated
  using (public.current_staff_role() is not null);  -- สถิตินิรนาม: ครูทุกบทบาทดูได้

-- ---------- audit_log: เขียนเพิ่มอย่างเดียว ----------
drop policy if exists audit_insert_staff on public.audit_log;
create policy audit_insert_staff on public.audit_log
  for insert to authenticated
  with check (public.current_staff_role() is not null);

drop policy if exists audit_select_admin on public.audit_log;
create policy audit_select_admin on public.audit_log
  for select to authenticated
  using (public.current_staff_role() = 'admin');
-- ไม่มี policy สำหรับ update/delete ⇒ แก้ไข/ลบบันทึกไม่ได้ ตาม ม.37

-- ============================================================================
--  SOS (เฟส 2): เหตุฉุกเฉินสดที่ครูเวรต้องเห็น "ข้ามเครื่อง"
-- ============================================================================
do $$ begin
  create type sos_status as enum ('active', 'resolved', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sos_outcome as enum ('real', 'drill', 'accident', 'prank');
exception when duplicate_object then null; end $$;

create table if not exists public.sos_alerts (
  id              text primary key,
  reporter        uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  place_th        text not null,
  place_en        text not null default '',
  status          sos_status not null default 'active',
  name            text not null default '',
  outcome         sos_outcome,
  -- ครูกด "รับเรื่อง" — เหตุยังเปิดอยู่ แต่คนกดได้รู้ว่ามีคนเห็นแล้วและกำลังไป
  acknowledged_at timestamptz,
  acknowledged_by text
);
-- ฐานข้อมูลที่สร้างไว้ก่อนมีสองคอลัมน์นี้ (create table if not exists จะข้ามไปเฉย ๆ)
alter table public.sos_alerts add column if not exists acknowledged_at timestamptz;
alter table public.sos_alerts add column if not exists acknowledged_by text;

create index if not exists sos_alerts_created_at_idx on public.sos_alerts (created_at desc);
create index if not exists sos_alerts_status_idx on public.sos_alerts (status);

alter table public.sos_alerts enable row level security;

-- นักเรียนเปิดเหตุของตัวเอง
drop policy if exists sos_insert_own on public.sos_alerts;
create policy sos_insert_own on public.sos_alerts
  for insert to authenticated
  with check (reporter = auth.uid());

-- เจ้าของเห็นของตัวเอง / ครูดูแลนักเรียนเห็นทุกเหตุ / ผู้ดูแลระบบไม่เห็น (PDPA)
drop policy if exists sos_select on public.sos_alerts;
create policy sos_select on public.sos_alerts
  for select to authenticated
  using (reporter = auth.uid() or public.can_see_student_data());

-- เจ้าของถอน/ย้ายจุดของตัวเอง, ครูปิดเหตุพร้อมระบุผล
drop policy if exists sos_update on public.sos_alerts;
create policy sos_update on public.sos_alerts
  for update to authenticated
  using (reporter = auth.uid() or public.can_see_student_data())
  with check (reporter = auth.uid() or public.can_see_student_data());
-- ไม่มี policy สำหรับ delete ⇒ ลบเหตุไม่ได้จากฝั่งแอป

-- ============================================================================
--  ผู้ดูแลระบบเริ่มต้น (bootstrap)
--  อีเมล Google ด้านล่างคือผู้ที่ล็อกอินเป็นผู้ดูแลระบบได้
--  (แยกเป็นคนละคำสั่ง และใช้ on conflict do nothing แบบไม่ระบุคอลัมน์
--   เพื่อให้รันซ้ำได้เสมอ ไม่ว่าจะชนที่ id หรือชนที่ email)
-- ============================================================================
insert into public.staff (id, email, name, role, title, emoji)
values ('admin-team', 'swellbeing04@gmail.com', 'ทีมผู้ดูแลระบบ', 'admin', 'ผู้ดูแลระบบ', '🛠️')
on conflict do nothing;

insert into public.staff (id, email, name, role, title, emoji)
values ('admin-pitakpong', 'pitakpongnalamphun@gmail.com', 'Pitakpong Nalamphun', 'admin', 'ผู้ดูแลระบบ', '🛡️')
on conflict do nothing;

-- ============================================================================
--  ตรวจผล
-- ============================================================================
select
  c.relname as ตาราง,
  c.relrowsecurity as "RLS เปิด",
  count(p.polname) as "จำนวน policy"
from pg_class c
left join pg_policy p on p.polrelid = c.oid
where c.relnamespace = 'public'::regnamespace
  and c.relname in ('staff', 'profiles', 'cases', 'anon_reports', 'audit_log')
group by c.relname, c.relrowsecurity
order by c.relname;
