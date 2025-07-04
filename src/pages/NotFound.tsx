import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background/60 to-accent/10 animate-fade-in">
      <div className="text-center space-y-6 p-8 rounded-2xl shadow-lg bg-card/80 backdrop-blur-md">
        <div className="mx-auto w-20 h-20 bg-gradient-hero rounded-full flex items-center justify-center shadow-glow mb-4 animate-pop-in">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-6xl font-extrabold bg-gradient-hero bg-clip-text text-transparent tracking-tight mb-2">404</h1>
        <p className="text-2xl text-muted-foreground font-semibold mb-4">Oops! Page not found</p>
        <Button asChild variant="hero" className="rounded-lg shadow-md transition-all duration-200 hover:scale-105">
          <a href="/">Return to Home</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
