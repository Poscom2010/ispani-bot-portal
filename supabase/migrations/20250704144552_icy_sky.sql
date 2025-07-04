/*
  # Enhanced proposal and earnings system

  1. New Tables
    - `earnings` - Track payments and earnings from proposals
    - `proposal_metrics` - Analytics and metrics for user proposals
  
  2. New Columns
    - Add status tracking to proposals table
    - Add value and completion tracking
  
  3. Security
    - Enable RLS on new tables
    - Add policies for user data access
  
  4. Performance
    - Add indexes for common queries
    - Add triggers for automatic updates
*/

-- Create the missing update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create enum for proposal status if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.proposal_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for earning status if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.earning_status AS ENUM ('pending', 'paid', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add status column to existing proposals table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'proposals' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.proposals 
        ADD COLUMN status proposal_status NOT NULL DEFAULT 'draft';
    END IF;
END $$;

-- Add estimated_value column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'proposals' AND column_name = 'estimated_value'
    ) THEN
        ALTER TABLE public.proposals 
        ADD COLUMN estimated_value DECIMAL(10,2);
    END IF;
END $$;

-- Add actual_value column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'proposals' AND column_name = 'actual_value'
    ) THEN
        ALTER TABLE public.proposals 
        ADD COLUMN actual_value DECIMAL(10,2);
    END IF;
END $$;

-- Add completion_date column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'proposals' AND column_name = 'completion_date'
    ) THEN
        ALTER TABLE public.proposals 
        ADD COLUMN completion_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Create earnings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.earnings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status earning_status NOT NULL DEFAULT 'pending',
    payment_date TIMESTAMP WITH TIME ZONE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create proposal_metrics table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.proposal_metrics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    total_proposals INTEGER DEFAULT 0,
    approved_proposals INTEGER DEFAULT 0,
    pending_proposals INTEGER DEFAULT 0,
    completed_proposals INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for earnings (drop if exists first)
DROP POLICY IF EXISTS "Users can view their own earnings" ON public.earnings;
CREATE POLICY "Users can view their own earnings" 
ON public.earnings 
FOR SELECT 
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own earnings" ON public.earnings;
CREATE POLICY "Users can insert their own earnings" 
ON public.earnings 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own earnings" ON public.earnings;
CREATE POLICY "Users can update their own earnings" 
ON public.earnings 
FOR UPDATE 
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own earnings" ON public.earnings;
CREATE POLICY "Users can delete their own earnings" 
ON public.earnings 
FOR DELETE 
USING (user_id = auth.uid());

-- Create RLS policies for proposal_metrics (drop if exists first)
DROP POLICY IF EXISTS "Users can view their own metrics" ON public.proposal_metrics;
CREATE POLICY "Users can view their own metrics" 
ON public.proposal_metrics 
FOR SELECT 
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own metrics" ON public.proposal_metrics;
CREATE POLICY "Users can insert their own metrics" 
ON public.proposal_metrics 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own metrics" ON public.proposal_metrics;
CREATE POLICY "Users can update their own metrics" 
ON public.proposal_metrics 
FOR UPDATE 
USING (user_id = auth.uid());

-- Add trigger for updated_at on earnings (drop if exists first)
DROP TRIGGER IF EXISTS update_earnings_updated_at ON public.earnings;
CREATE TRIGGER update_earnings_updated_at
    BEFORE UPDATE ON public.earnings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_proposals_user_status ON public.proposals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_earnings_user_status ON public.earnings(user_id, status);
CREATE INDEX IF NOT EXISTS idx_proposal_metrics_user ON public.proposal_metrics(user_id);