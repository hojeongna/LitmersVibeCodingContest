-- Create ai_usage table for rate limiting
CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_time ON ai_usage(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own usage
CREATE POLICY "Users can view their own usage"
  ON ai_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert usage (via API)
-- But wait, if we use client-side Supabase, user needs insert permission?
-- No, the API routes use createAdminClient (service role) to record usage.
-- So we don't strictly need an INSERT policy for authenticated users if we only insert from server.
-- However, if we want to be safe or if future client-side usage is needed:
-- Actually, let's keep it restrictive. Only server (service role) inserts.
-- Service role bypasses RLS, so no policy needed for insert if only server does it.
