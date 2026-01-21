-- Execute in Supabase SQL Editor

-- 1. Create user_branches table (for Coordinators)
CREATE TABLE IF NOT EXISTS user_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, branch_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_branches_user ON user_branches(user_id);
CREATE INDEX IF NOT EXISTS idx_user_branches_branch ON user_branches(branch_id);

-- Enable RLS
ALTER TABLE user_branches ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own branch assignments
DROP POLICY IF EXISTS "Users can view own branch assignments" ON user_branches;
CREATE POLICY "Users can view own branch assignments"
  ON user_branches FOR SELECT
  USING (user_id = auth.uid());

-- 2. Update RLS Policies (Role-Based Access)

-- Drop old basic policies
DROP POLICY IF EXISTS "Branch managers see own branch" ON daily_reports;
DROP POLICY IF EXISTS "Users can insert own branch reports" ON daily_reports;

-- New comprehensive policies
CREATE POLICY "Role-based report SELECT" ON daily_reports
FOR SELECT USING (
  -- General Manager & Accountant: see all
  EXISTS (
    SELECT 1 FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = auth.uid()
    AND r.name IN ('general_manager', 'accountant', 'warehouse_manager')
  )
  OR
  -- Coordinator: see assigned branches
  branch_id IN (
    SELECT branch_id FROM user_branches WHERE user_id = auth.uid()
  )
  OR
  -- Branch Manager: see own branch only
  branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Branch managers can INSERT" ON daily_reports
FOR INSERT WITH CHECK (
  branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
  AND EXISTS (
    SELECT 1 FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = auth.uid()
    AND r.name = 'branch_manager'
  )
);

CREATE POLICY "Branch managers can UPDATE own" ON daily_reports
FOR UPDATE USING (
  branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
  AND created_by = auth.uid()
);

CREATE POLICY "Branch managers can DELETE own" ON daily_reports
FOR DELETE USING (
  branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
  AND created_by = auth.uid()
);

-- 3. Add is_deleted to daily_reports (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='daily_reports' AND column_name='is_deleted'
  ) THEN
    ALTER TABLE daily_reports ADD COLUMN is_deleted BOOLEAN DEFAULT false;
  END IF;
END $$;
