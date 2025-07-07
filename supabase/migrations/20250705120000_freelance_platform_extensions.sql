-- Freelance Platform Extensions Migration
-- 1. Extend profiles table with standard fields and role enum
-- 2. Extend proposals table for docx storage
-- 3. Create jobs, messages, and invoices tables

-- 1. User Role Enum
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('freelancer', 'client', 'both');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Extend profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'freelancer',
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. Extend proposals table for docx storage
ALTER TABLE public.proposals
ADD COLUMN IF NOT EXISTS docx_url TEXT,
ADD COLUMN IF NOT EXISTS draft_docx_url TEXT;

-- 4. Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    posted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    pay_per_hour DECIMAL(10,2),
    deadline TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    file_url TEXT,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    paid_at TIMESTAMP WITH TIME ZONE
);

-- 7. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON public.jobs(posted_by);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_invoices_proposal ON public.invoices(proposal_id); 