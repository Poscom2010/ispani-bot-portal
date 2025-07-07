/*
  # Freelance Platform Extensions Migration
  
  1. New Tables
    - `jobs` - Job postings and management
    - `messages` - Communication between users
    - `invoices` - Invoice management
    - `job_applications` - Job application tracking
    - `notifications` - User notifications
    - `skills` - Master skills list
    - `job_skills` - Skills required for jobs
    - `profile_skills` - User skills and proficiency
    - `job_milestones` - Project milestones
    - `reviews` - User reviews and ratings
  
  2. Extensions
    - Extend profiles table with freelance fields
    - Extend proposals table for document storage
    - Add proper RLS policies
  
  3. Security
    - Enable RLS on all tables
    - Add comprehensive policies
*/

-- 1. User Role Enum (safe creation)
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('freelancer', 'client', 'both');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Extend profiles table (safe column additions)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE public.profiles ADD COLUMN bio TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'skills') THEN
        ALTER TABLE public.profiles ADD COLUMN skills TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'hourly_rate') THEN
        ALTER TABLE public.profiles ADD COLUMN hourly_rate DECIMAL(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'location') THEN
        ALTER TABLE public.profiles ADD COLUMN location TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role user_role NOT NULL DEFAULT 'freelancer';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- 3. Extend proposals table for docx storage (safe column additions)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposals' AND column_name = 'docx_url') THEN
        ALTER TABLE public.proposals ADD COLUMN docx_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposals' AND column_name = 'draft_docx_url') THEN
        ALTER TABLE public.proposals ADD COLUMN draft_docx_url TEXT;
    END IF;
END $$;

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
    content TEXT,
    file_url TEXT,
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

-- 7. Job Applications Table
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

-- 8. Skills Master Table
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT
);

-- 9. Job Skills Junction Table
CREATE TABLE IF NOT EXISTS public.job_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
    importance_level TEXT DEFAULT 'Medium',
    is_required BOOLEAN DEFAULT false
);

-- 10. Profile Skills Junction Table
CREATE TABLE IF NOT EXISTS public.profile_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
    proficiency_level TEXT NOT NULL,
    years_experience INTEGER NOT NULL
);

-- 11. Job Milestones Table
CREATE TABLE IF NOT EXISTS public.job_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending',
    amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 12. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Jobs
DROP POLICY IF EXISTS "Users can view all jobs" ON public.jobs;
CREATE POLICY "Users can view all jobs" ON public.jobs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own jobs" ON public.jobs;
CREATE POLICY "Users can insert their own jobs" ON public.jobs FOR INSERT WITH CHECK (posted_by = auth.uid());

DROP POLICY IF EXISTS "Users can update their own jobs" ON public.jobs;
CREATE POLICY "Users can update their own jobs" ON public.jobs FOR UPDATE USING (posted_by = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own jobs" ON public.jobs;
CREATE POLICY "Users can delete their own jobs" ON public.jobs FOR DELETE USING (posted_by = auth.uid());

-- RLS Policies for Messages
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- RLS Policies for Job Applications
DROP POLICY IF EXISTS "Users can view applications for their jobs" ON public.job_applications;
CREATE POLICY "Users can view applications for their jobs" ON public.job_applications FOR SELECT USING (
    applicant_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = job_applications.job_id AND jobs.posted_by = auth.uid())
);

DROP POLICY IF EXISTS "Users can create applications" ON public.job_applications;
CREATE POLICY "Users can create applications" ON public.job_applications FOR INSERT WITH CHECK (applicant_id = auth.uid());

-- RLS Policies for Skills (public read)
DROP POLICY IF EXISTS "Anyone can view skills" ON public.skills;
CREATE POLICY "Anyone can view skills" ON public.skills FOR SELECT USING (true);

-- RLS Policies for Profile Skills
DROP POLICY IF EXISTS "Users can manage their own skills" ON public.profile_skills;
CREATE POLICY "Users can manage their own skills" ON public.profile_skills FOR ALL USING (profile_id = auth.uid());

-- RLS Policies for Reviews
DROP POLICY IF EXISTS "Users can view reviews" ON public.reviews;
CREATE POLICY "Users can view reviews" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (reviewer_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON public.jobs(posted_by);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_job_id ON public.messages(job_id);
CREATE INDEX IF NOT EXISTS idx_messages_proposal_id ON public.messages(proposal_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_invoices_proposal ON public.invoices(proposal_id);
CREATE INDEX IF NOT EXISTS idx_invoices_sender_id ON public.invoices(sender_id);
CREATE INDEX IF NOT EXISTS idx_invoices_receiver_id ON public.invoices(receiver_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_applicant_id ON public.job_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_job_skills_job_id ON public.job_skills(job_id);
CREATE INDEX IF NOT EXISTS idx_profile_skills_profile_id ON public.profile_skills(profile_id);
CREATE INDEX IF NOT EXISTS idx_job_milestones_job_id ON public.job_milestones(job_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON public.reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_job_id ON public.reviews(job_id);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_proposals_user_id ON public.proposals(user_id);
CREATE INDEX IF NOT EXISTS idx_earnings_proposal_id ON public.earnings(proposal_id);

-- Insert some default skills
INSERT INTO public.skills (name, category) VALUES
    ('JavaScript', 'Programming'),
    ('React', 'Frontend'),
    ('Node.js', 'Backend'),
    ('Python', 'Programming'),
    ('UI/UX Design', 'Design'),
    ('Content Writing', 'Writing'),
    ('SEO', 'Marketing'),
    ('Data Analysis', 'Analytics'),
    ('Mobile Development', 'Development'),
    ('Project Management', 'Management')
ON CONFLICT (name) DO NOTHING;