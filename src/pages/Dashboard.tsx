import React from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, LogOut, FileText } from 'lucide-react';
import ispaniBotIcon from '@/assets/ispanibot-icon.png';

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();

  // Redirect if not authenticated
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center shadow-soft">
              <img src={ispaniBotIcon} alt="ISpaniBot" className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                ISpaniBot
              </h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user?.email}
              </p>
            </div>
          </div>
          
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              My Proposals
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Manage and track your AI-generated proposals. Create, edit, and organize your content with the power of ISpaniBot.
            </p>
          </div>

          {/* Proposals Card */}
          <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Your Proposals</CardTitle>
              <CardDescription>
                All your AI-generated proposals will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground text-lg">
                  Proposals will be listed here
                </p>
                <div className="flex justify-center">
                  <Button variant="hero" size="lg">
                    <FileText className="h-4 w-4" />
                    Create Your First Proposal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary">0</div>
                <p className="text-sm text-muted-foreground">Total Proposals</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-accent">0</div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary-glow">0</div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;