CREATE TABLE public.analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_text TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_description TEXT DEFAULT '',
  scores JSONB NOT NULL,
  before_score INTEGER NOT NULL,
  strengths JSONB NOT NULL DEFAULT '[]',
  weaknesses JSONB NOT NULL DEFAULT '[]',
  improvements JSONB NOT NULL DEFAULT '[]',
  missing_keywords JSONB NOT NULL DEFAULT '[]',
  improved_resume TEXT NOT NULL DEFAULT '',
  suggestions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analyses" ON public.analysis_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read analyses" ON public.analysis_history FOR SELECT USING (true);
CREATE POLICY "Anyone can delete analyses" ON public.analysis_history FOR DELETE USING (true);