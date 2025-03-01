-- Create system_notifications table
CREATE TABLE IF NOT EXISTS public.system_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  created_by UUID REFERENCES auth.users(id)
);

-- Add RLS policies
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all notifications
CREATE POLICY "Allow admins to read all notifications"
  ON public.system_notifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to create notifications
CREATE POLICY "Allow admins to create notifications"
  ON public.system_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to update notifications
CREATE POLICY "Allow admins to update notifications"
  ON public.system_notifications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create index for faster queries
CREATE INDEX system_notifications_created_at_idx ON public.system_notifications (created_at DESC);

-- Add some initial notifications for testing
INSERT INTO public.system_notifications (title, message, type, priority)
VALUES 
  ('Welcome to Admin Dashboard', 'The new admin dashboard is now available with enhanced monitoring capabilities.', 'info', 'medium'),
  ('System Update Scheduled', 'A system update is scheduled for this weekend. Please monitor for any issues.', 'warning', 'high'),
  ('Database Backup Success', 'Weekly database backup completed successfully.', 'success', 'low'); 