-- Add token column to team_invites table
-- This token is used for invite links and accepting invitations

ALTER TABLE public.team_invites
ADD COLUMN IF NOT EXISTS token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_team_invites_token ON public.team_invites(token);

-- Add role column to team_invites table (optional, for future use)
ALTER TABLE public.team_invites
ADD COLUMN IF NOT EXISTS role VARCHAR(20) CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER'));
