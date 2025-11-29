-- Jira Lite MVP - Initial Database Schema
-- Generated: 2025-11-29
-- Version: 1.0.0

-- ============================================
-- 1. PROFILES TABLE (auth.users 확장)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ  -- Soft Delete
);

-- ============================================
-- 2. TEAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ  -- Soft Delete
);

-- ============================================
-- 3. TEAM_MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- ============================================
-- 4. TEAM_INVITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  email VARCHAR(255) NOT NULL,
  invited_by UUID REFERENCES public.profiles(id) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,  -- 7일 후
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ  -- Soft Delete
);

-- ============================================
-- 6. PROJECT_FAVORITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_favorites (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, project_id)
);

-- ============================================
-- 7. STATUSES TABLE (Custom Statuses per Project)
-- ============================================
CREATE TABLE IF NOT EXISTS public.statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(30) NOT NULL,
  color VARCHAR(7),  -- HEX color
  position INTEGER NOT NULL,
  wip_limit INTEGER,  -- null = unlimited
  is_default BOOLEAN DEFAULT FALSE
);

-- ============================================
-- 8. LABELS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(30) NOT NULL,
  color VARCHAR(7) NOT NULL  -- HEX color
);

-- ============================================
-- 9. ISSUES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) NOT NULL,
  assignee_id UUID REFERENCES public.profiles(id),
  status_id UUID REFERENCES public.statuses(id) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  priority VARCHAR(10) DEFAULT 'MEDIUM' CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
  due_date DATE,
  position INTEGER NOT NULL,  -- 컬럼 내 순서
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ  -- Soft Delete
);

-- ============================================
-- 10. ISSUE_LABELS TABLE (다대다 관계)
-- ============================================
CREATE TABLE IF NOT EXISTS public.issue_labels (
  issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE NOT NULL,
  label_id UUID REFERENCES public.labels(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (issue_id, label_id)
);

-- ============================================
-- 11. SUBTASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(200) NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 12. COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ  -- Soft Delete
);

-- ============================================
-- 13. ISSUE_HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.issue_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE NOT NULL,
  changed_by UUID REFERENCES public.profiles(id) NOT NULL,
  field_name VARCHAR(50) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 14. AI_CACHE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.ai_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE NOT NULL,
  cache_type VARCHAR(20) NOT NULL,  -- 'summary', 'suggestion', 'comment_summary'
  content_hash VARCHAR(64) NOT NULL,  -- description/comments 해시
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 15. AI_RATE_LIMITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.ai_rate_limits (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  minute_count INTEGER DEFAULT 0,
  minute_reset_at TIMESTAMPTZ,
  daily_count INTEGER DEFAULT 0,
  daily_reset_at TIMESTAMPTZ
);

-- ============================================
-- 16. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(30) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 17. TEAM_ACTIVITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES public.profiles(id) NOT NULL,
  action VARCHAR(50) NOT NULL,
  target_type VARCHAR(30),
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_team_id ON public.projects(team_id);
CREATE INDEX IF NOT EXISTS idx_issues_project_id ON public.issues(project_id);
CREATE INDEX IF NOT EXISTS idx_issues_status_id ON public.issues(status_id);
CREATE INDEX IF NOT EXISTS idx_issues_assignee_id ON public.issues(assignee_id);
CREATE INDEX IF NOT EXISTS idx_comments_issue_id ON public.comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_team_activities_team_id ON public.team_activities(team_id);
CREATE INDEX IF NOT EXISTS idx_ai_cache_issue_id ON public.ai_cache(issue_id);

-- ============================================
-- TRIGGER FUNCTIONS
-- ============================================

-- Function: Handle new user (auto-create profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.teams;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.projects;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.issues;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.issues
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.comments;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_activities ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: PROFILES
-- ============================================
-- Users can view any profile (needed for displaying assignees, etc.)
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- RLS POLICIES: TEAMS
-- ============================================
-- Team members can view their teams
CREATE POLICY "Team members can view team"
  ON public.teams FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

-- Authenticated users can create teams
CREATE POLICY "Authenticated users can create teams"
  ON public.teams FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Team owners/admins can update teams
CREATE POLICY "Team owners and admins can update team"
  ON public.teams FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')
    )
  );

-- Team owners can soft delete teams
CREATE POLICY "Team owners can delete team"
  ON public.teams FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- ============================================
-- RLS POLICIES: TEAM_MEMBERS
-- ============================================
-- Team members can view other members
CREATE POLICY "Team members can view team members"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

-- Team owners/admins can manage members
CREATE POLICY "Team owners and admins can add members"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')
    )
    OR
    -- Allow self-insert when creating a team (owner)
    user_id = auth.uid()
  );

CREATE POLICY "Team owners and admins can update members"
  ON public.team_members FOR UPDATE
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')
    )
  );

CREATE POLICY "Team owners and admins can remove members"
  ON public.team_members FOR DELETE
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')
    )
    OR user_id = auth.uid()  -- Members can leave
  );

-- ============================================
-- RLS POLICIES: TEAM_INVITES
-- ============================================
CREATE POLICY "Team members can view invites"
  ON public.team_invites FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can create invites"
  ON public.team_invites FOR INSERT
  TO authenticated
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')
    )
  );

CREATE POLICY "Team admins can delete invites"
  ON public.team_invites FOR DELETE
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')
    )
  );

-- ============================================
-- RLS POLICIES: PROJECTS
-- ============================================
CREATE POLICY "Team members can view projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Team members can create projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can delete projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- ============================================
-- RLS POLICIES: PROJECT_FAVORITES
-- ============================================
CREATE POLICY "Users can view their favorites"
  ON public.project_favorites FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can add favorites"
  ON public.project_favorites FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove favorites"
  ON public.project_favorites FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- RLS POLICIES: STATUSES
-- ============================================
CREATE POLICY "Team members can view statuses"
  ON public.statuses FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can manage statuses"
  ON public.statuses FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update statuses"
  ON public.statuses FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can delete statuses"
  ON public.statuses FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES: LABELS
-- ============================================
CREATE POLICY "Team members can view labels"
  ON public.labels FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can manage labels"
  ON public.labels FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES: ISSUES
-- ============================================
CREATE POLICY "Team members can view issues"
  ON public.issues FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Team members can create issues"
  ON public.issues FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update issues"
  ON public.issues FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Issue owners can delete issues"
  ON public.issues FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- ============================================
-- RLS POLICIES: ISSUE_LABELS
-- ============================================
CREATE POLICY "Team members can manage issue labels"
  ON public.issue_labels FOR ALL
  TO authenticated
  USING (
    issue_id IN (
      SELECT i.id FROM public.issues i
      JOIN public.projects p ON i.project_id = p.id
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES: SUBTASKS
-- ============================================
CREATE POLICY "Team members can view subtasks"
  ON public.subtasks FOR SELECT
  TO authenticated
  USING (
    issue_id IN (
      SELECT i.id FROM public.issues i
      JOIN public.projects p ON i.project_id = p.id
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can manage subtasks"
  ON public.subtasks FOR ALL
  TO authenticated
  USING (
    issue_id IN (
      SELECT i.id FROM public.issues i
      JOIN public.projects p ON i.project_id = p.id
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES: COMMENTS
-- ============================================
CREATE POLICY "Team members can view comments"
  ON public.comments FOR SELECT
  TO authenticated
  USING (
    issue_id IN (
      SELECT i.id FROM public.issues i
      JOIN public.projects p ON i.project_id = p.id
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Team members can create comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (
    issue_id IN (
      SELECT i.id FROM public.issues i
      JOIN public.projects p ON i.project_id = p.id
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Comment authors can update comments"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Comment authors can delete comments"
  ON public.comments FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- ============================================
-- RLS POLICIES: ISSUE_HISTORY
-- ============================================
CREATE POLICY "Team members can view issue history"
  ON public.issue_history FOR SELECT
  TO authenticated
  USING (
    issue_id IN (
      SELECT i.id FROM public.issues i
      JOIN public.projects p ON i.project_id = p.id
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create issue history"
  ON public.issue_history FOR INSERT
  TO authenticated
  WITH CHECK (
    issue_id IN (
      SELECT i.id FROM public.issues i
      JOIN public.projects p ON i.project_id = p.id
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES: AI_CACHE
-- ============================================
CREATE POLICY "Team members can view AI cache"
  ON public.ai_cache FOR SELECT
  TO authenticated
  USING (
    issue_id IN (
      SELECT i.id FROM public.issues i
      JOIN public.projects p ON i.project_id = p.id
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can manage AI cache"
  ON public.ai_cache FOR ALL
  TO authenticated
  USING (
    issue_id IN (
      SELECT i.id FROM public.issues i
      JOIN public.projects p ON i.project_id = p.id
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES: AI_RATE_LIMITS
-- ============================================
CREATE POLICY "Users can view their rate limits"
  ON public.ai_rate_limits FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their rate limits"
  ON public.ai_rate_limits FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- RLS POLICIES: NOTIFICATIONS
-- ============================================
CREATE POLICY "Users can view their notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);  -- Notifications are created by system/triggers

CREATE POLICY "Users can update their notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- RLS POLICIES: TEAM_ACTIVITIES
-- ============================================
CREATE POLICY "Team members can view activities"
  ON public.team_activities FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can create activities"
  ON public.team_activities FOR INSERT
  TO authenticated
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;
