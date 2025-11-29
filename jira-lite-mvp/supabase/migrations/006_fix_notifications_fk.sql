-- Fix notifications table foreign keys
-- This migration fixes the foreign key references to use profiles instead of auth.users

-- Drop existing foreign key constraints
ALTER TABLE notifications 
  DROP CONSTRAINT IF EXISTS notifications_user_id_fkey,
  DROP CONSTRAINT IF EXISTS notifications_actor_id_fkey;

-- Add correct foreign key constraints
ALTER TABLE notifications
  ADD CONSTRAINT notifications_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_actor_id_fkey 
    FOREIGN KEY (actor_id) REFERENCES profiles(id) ON DELETE SET NULL;
