-- =====================================================
-- KeenCare: Create user_activity_logs table
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  path        TEXT,
  status      TEXT DEFAULT 'Completed',
  details     JSONB,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Fast lookup indexes
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON public.user_activity_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_activity_type    ON public.user_activity_logs (type);
CREATE INDEX IF NOT EXISTS idx_activity_created ON public.user_activity_logs (created_at DESC);

-- Row Level Security
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own activity"
  ON public.user_activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own activity"
  ON public.user_activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own activity"
  ON public.user_activity_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime (for live dashboard updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_activity_logs;
