import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import ispaniBotIcon from '@/assets/ispanibot-icon.png';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [dbStatus, setDbStatus] = useState<'loading' | 'connected' | 'error'>('loading');

  useEffect(() => {
    // Test database connection
    const testConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        
        if (error) {
          console.log('Database test error:', error);
          setDbStatus('error');
        } else {
          console.log('Database connection successful');
          setDbStatus('connected');
        }
      } catch (err) {
        console.log('Database connection failed:', err);
        setDbStatus('error');
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-hero rounded-2xl flex items-center justify-center shadow-glow">
            <img src={ispaniBotIcon} alt="ISpaniBot" className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold bg-gradient-hero bg-clip-text text-transparent tracking-tight">
              ISpaniBot
            </h1>
            <p className="text-muted-foreground text-base">
              Your AI-powered assistant for smarter conversations
            </p>
          </div>
        </div>

        {/* Status Card */}
        <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">System Status</CardTitle>
            <CardDescription>Checking database connection...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              {dbStatus === 'loading' && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
              {dbStatus === 'connected' && <CheckCircle className="h-5 w-5 text-green-500" />}
              {dbStatus === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
              <span className="text-sm">
                Database: {dbStatus === 'loading' ? 'Connecting...' : 
                          dbStatus === 'connected' ? 'Connected' : 'Connection Failed'}
              </span>
            </div>
            
            {dbStatus === 'connected' && (
              <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                ✓ All systems operational
              </div>
            )}
            
            {dbStatus === 'error' && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                ⚠ Database connection issues detected
              </div>
            )}
          </CardContent>
        </Card>

        {/* Auth Card */}
        <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm transition-all duration-500 animate-fade-in">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center font-bold">
              Welcome to ISpaniBot
            </CardTitle>
            <CardDescription className="text-center text-base">
              Sign in to access your AI-powered workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Link to="/auth">
              <Button
                variant="hero"
                size="lg"
                className="w-full py-3 rounded-lg font-semibold text-lg shadow-md transition-all duration-200 hover:scale-[1.03] hover:shadow-lg focus:ring-2 focus:ring-primary focus:outline-none"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
