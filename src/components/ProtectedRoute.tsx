import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          setProfile(data);
          setProfileLoading(false);
        });
    } else {
      setProfileLoading(false);
    }
  }, [user]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login page with the attempted location
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Allow navigation to profile page even if profile is incomplete
  // Only redirect to profile if user is on a different page and profile is completely missing
  if (!profile && location.pathname !== '/profile') {
    // Create a basic profile if none exists
    if (user) {
      const createProfile = async () => {
        try {
          await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              role: 'freelancer',
              skills: [],
              verified: false
            });
        } catch (error) {
          console.log('Profile creation error:', error);
          // Allow navigation anyway
        }
      };
      createProfile();
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;