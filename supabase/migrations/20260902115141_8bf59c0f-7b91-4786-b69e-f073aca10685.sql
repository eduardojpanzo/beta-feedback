CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  nome TEXT,
  tipo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'nao_visto'
);

GRANT SELECT, INSERT ON public.reports TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_public_select" ON public.reports FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "reports_public_insert" ON public.reports FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "reports_admin_update" ON public.reports FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "reports_admin_delete" ON public.reports FOR DELETE TO authenticated USING (true);

CREATE INDEX reports_created_at_idx ON public.reports (created_at DESC);