CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    cover_letter TEXT,
    status TEXT DEFAULT 'pending',
    proposed_rate DECIMAL(10,2),
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
); 