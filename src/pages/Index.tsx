import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Bot, ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();

  // Redirect authenticated users to dashboard
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center shadow-soft">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              ISpaniBot
            </h1>
          </div>
          
          <Button asChild variant="hero">
            <Link to="/auth">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-hero rounded-3xl flex items-center justify-center shadow-glow">
              <Bot className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Welcome to ISpaniBot
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your AI-powered assistant for creating intelligent proposals and managing your projects with ease
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="hero" size="lg">
              <Link to="/auth">
                Start Creating
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ai" size="lg">
              <Link to="/auth">
                Sign In
              </Link>
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">AI-Powered</h3>
              <p className="text-muted-foreground">
                Generate intelligent proposals with advanced AI technology
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Create and manage proposals in minutes, not hours
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Secure</h3>
              <p className="text-muted-foreground">
                Your data is protected with enterprise-grade security
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
