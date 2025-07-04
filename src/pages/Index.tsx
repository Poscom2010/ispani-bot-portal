import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';
import ispaniBotIcon from '@/assets/ispanibot-icon.png';

const Index = () => {
  const { user, loading } = useAuth();

  // Redirect authenticated users to dashboard
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm shadow-md animate-fade-in">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center shadow-glow">
              <img src={ispaniBotIcon} alt="ISpaniBot" className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent tracking-tight">
              ISpaniBot
            </h1>
          </div>
          <Button asChild variant="hero" className="rounded-lg shadow-md transition-all duration-200 hover:scale-105">
            <Link to="/auth">
              Get Started
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background/60 to-accent/10 pointer-events-none animate-fade-in-slow" />
        <div className="container mx-auto px-4 py-16 z-10">
          <div className="max-w-4xl mx-auto text-center space-y-12 animate-fade-in">
            <div className="space-y-4">
              <div className="mx-auto w-20 h-20 bg-gradient-hero rounded-3xl flex items-center justify-center shadow-glow">
                <img src={ispaniBotIcon} alt="ISpaniBot" className="h-12 w-12" />
              </div>
              <h1 className="text-5xl font-extrabold bg-gradient-hero bg-clip-text text-transparent tracking-tight drop-shadow-lg">
                Welcome to ISpaniBot
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Your AI-powered assistant for creating intelligent proposals and managing your projects with ease
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="hero" size="lg" className="rounded-lg shadow-lg transition-all duration-200 hover:scale-105">
                <Link to="/auth">
                  Start Creating
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="ai" size="lg" className="rounded-lg shadow-lg transition-all duration-200 hover:scale-105">
                <Link to="/auth">
                  Sign In
                </Link>
              </Button>
            </div>
            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="bg-card/80 rounded-2xl shadow-md p-6 text-center space-y-4 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 animate-fade-in">
                <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center transition-transform duration-200 hover:scale-110">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">AI-Powered</h3>
                <p className="text-muted-foreground">
                  Generate intelligent proposals with advanced AI technology
                </p>
              </div>
              <div className="bg-card/80 rounded-2xl shadow-md p-6 text-center space-y-4 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 animate-fade-in delay-100">
                <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center transition-transform duration-200 hover:scale-110">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Lightning Fast</h3>
                <p className="text-muted-foreground">
                  Create and manage proposals in minutes, not hours
                </p>
              </div>
              <div className="bg-card/80 rounded-2xl shadow-md p-6 text-center space-y-4 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 animate-fade-in delay-200">
                <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center transition-transform duration-200 hover:scale-110">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Secure</h3>
                <p className="text-muted-foreground">
                  Your data is protected with enterprise-grade security
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
