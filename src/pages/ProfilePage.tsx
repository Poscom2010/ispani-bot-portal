import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Settings, Edit, ArrowLeft, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProfileModal from './Profile';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
          Profile Settings
        </h1>
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
          Close
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Overview Card */}
        <Card className="shadow-card border border-border/60 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {user?.user_metadata?.full_name || user?.email || 'User'}
                </h3>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card className="shadow-card border border-border/60 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => setIsModalOpen(true)} 
              variant="outline" 
              className="w-full justify-start"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile Information
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              disabled
            >
              <Settings className="h-4 w-4 mr-2" />
              Account Settings (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Profile Modal */}
      <ProfileModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
};

export default ProfilePage; 