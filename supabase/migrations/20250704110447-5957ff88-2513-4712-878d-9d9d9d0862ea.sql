-- Create the missing update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create enum for proposal status
CREATE TYPE public.proposal_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'completed');

-- Create enum for earning status  
CREATE TYPE public.earning_status AS ENUM ('pending', 'paid', 'cancelled');

-- Add status column to existing proposals table
ALTER TABLE public.proposals 
ADD COLUMN status proposal_status NOT NULL DEFAULT 'draft',
ADD COLUMN estimated_value DECIMAL(10,2),
ADD COLUMN actual_value DECIMAL(10,2),
ADD COLUMN completion_date TIMESTAMP WITH TIME ZONE;

-- Create earnings table for tracking payments
CREATE TABLE public.earnings (
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

-- Create proposal_metrics table for analytics
CREATE TABLE public.proposal_metrics (
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

-- Create RLS policies for earnings
CREATE POLICY "Users can view their own earnings" 
ON public.earnings 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own earnings" 
ON public.earnings 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own earnings" 
ON public.earnings 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own earnings" 
ON public.earnings 
FOR DELETE 
USING (user_id = auth.uid());

-- Create RLS policies for proposal_metrics
CREATE POLICY "Users can view their own metrics" 
ON public.proposal_metrics 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own metrics" 
ON public.proposal_metrics 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own metrics" 
ON public.proposal_metrics 
FOR UPDATE 
USING (user_id = auth.uid());

-- Add trigger for updated_at on earnings
CREATE TRIGGER update_earnings_updated_at
    BEFORE UPDATE ON public.earnings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_proposals_user_status ON public.proposals(user_id, status);
CREATE INDEX idx_earnings_user_status ON public.earnings(user_id, status);
CREATE INDEX idx_proposal_metrics_user ON public.proposal_metrics(user_id);