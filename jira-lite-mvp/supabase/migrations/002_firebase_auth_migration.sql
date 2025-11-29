-- Migration: Convert profiles.id from UUID to TEXT for Firebase Auth compatibility
-- Date: 2025-11-29
-- Reason: Firebase Auth UIDs are strings, not UUIDs

-- Step 1: Drop all foreign key constraints that reference profiles.id
ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_owner_id_fkey;
ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_members_user_id_fkey;
ALTER TABLE team_invites DROP CONSTRAINT IF EXISTS team_invites_invited_by_fkey;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_owner_id_fkey;
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_owner_id_fkey;
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_assignee_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_author_id_fkey;
ALTER TABLE issue_history DROP CONSTRAINT IF EXISTS issue_history_changed_by_fkey;

-- Step 2: Drop the foreign key constraint on profiles.id to auth.users
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Step 3: Change profiles.id from UUID to TEXT
ALTER TABLE profiles ALTER COLUMN id TYPE TEXT;

-- Step 4: Change all foreign key columns to TEXT
ALTER TABLE teams ALTER COLUMN owner_id TYPE TEXT;
ALTER TABLE team_members ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE team_invites ALTER COLUMN invited_by TYPE TEXT;
ALTER TABLE projects ALTER COLUMN owner_id TYPE TEXT;
ALTER TABLE issues ALTER COLUMN owner_id TYPE TEXT;
ALTER TABLE issues ALTER COLUMN assignee_id TYPE TEXT;
ALTER TABLE comments ALTER COLUMN author_id TYPE TEXT;
ALTER TABLE issue_history ALTER COLUMN changed_by TYPE TEXT;

-- Step 5: Re-add foreign key constraints
ALTER TABLE teams ADD CONSTRAINT teams_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE team_members ADD CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE team_invites ADD CONSTRAINT team_invites_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE projects ADD CONSTRAINT projects_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE issues ADD CONSTRAINT issues_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE issues ADD CONSTRAINT issues_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE comments ADD CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE issue_history ADD CONSTRAINT issue_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES profiles(id) ON DELETE CASCADE;

-- Step 6: Add email column to profiles (Firebase users have email as primary identifier)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;

-- Step 7: Update existing data (if any) - this is safe even if table is empty
-- Note: This will fail for existing data, but that's okay for a fresh setup
