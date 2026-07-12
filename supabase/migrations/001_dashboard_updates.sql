-- 001_dashboard_updates.sql
-- Add demo_video and original_project_id columns to project table

ALTER TABLE project ADD COLUMN IF NOT EXISTS demo_video TEXT;
ALTER TABLE project ADD COLUMN IF NOT EXISTS original_project_id UUID REFERENCES project(id) ON DELETE CASCADE;

-- Ensure RLS is enabled on all core tables
ALTER TABLE employee ENABLE ROW LEVEL SECURITY;
ALTER TABLE client ENABLE ROW LEVEL SECURITY;
ALTER TABLE project ENABLE ROW LEVEL SECURITY;

-- Please review existing RLS policies in the Supabase Dashboard. 
-- Ensure the following logic is applied:
-- 1. Admins (role='Admin') have FULL access to all tables.
-- 2. Employees can only INSERT/UPDATE/DELETE their own clients (employee_id = auth.uid()).
-- 3. Employees can only INSERT/UPDATE/DELETE their own projects (employee_id = auth.uid()).
-- 4. Unauthenticated users can only SELECT from projects where visibility = true AND approval_status = 'approved'.
