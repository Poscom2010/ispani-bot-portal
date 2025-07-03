-- Add verified field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN verified boolean DEFAULT false NOT NULL;