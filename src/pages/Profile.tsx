import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader as CardHeaderUI, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Select } from '@/components/ui/select';

const roleOptions = [
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'client', label: 'Client' },
  { value: 'both', label: 'Both' },
];



interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ open, onOpenChange }) => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    full_name: '',
    bio: '',
    skills: '',
    hourly_rate: '',
    location: '',
    avatar_url: '',
    role: 'freelancer',
  });
  const [saving, setSaving] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState({ skill_name: '' });

  useEffect(() => {
    if (user && open) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (data) {
            setProfile({
              full_name: data.full_name || '',
              bio: data.bio || '',
              skills: (data.skills || []).join(', '),
              hourly_rate: data.hourly_rate ? String(data.hourly_rate) : '',
              location: data.location || '',
              avatar_url: data.avatar_url || '',
              role: data.role || 'freelancer',
            });
            setUserSkills(data.skills || []);
          }
          setProfileLoaded(true);
        });
    }
  }, [user, open]);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: profile.full_name,
      bio: profile.bio,
      skills: userSkills,
      hourly_rate: profile.hourly_rate ? Number(profile.hourly_rate) : null,
      location: profile.location,
      avatar_url: profile.avatar_url,
      role: profile.role as 'freelancer' | 'client' | 'both',
    });
    setSaving(false);
    if (error) {
      toast({
        title: 'Profile Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved.',
      });
      onOpenChange(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkill.skill_name.trim()) {
      toast({ title: 'Error', description: 'Please enter a skill name.', variant: 'destructive' });
      return;
    }
    
    if (userSkills.includes(newSkill.skill_name.trim())) {
      toast({ title: 'Error', description: 'This skill is already in your profile.', variant: 'destructive' });
      return;
    }
    
    setUserSkills(prev => [...prev, newSkill.skill_name.trim()]);
    setNewSkill({ skill_name: '' });
    toast({ title: 'Skill Added', description: 'Skill added to your profile. Remember to save your profile.' });
  };

  const handleRemoveSkill = (skillName: string) => {
    setUserSkills(prev => prev.filter(skill => skill !== skillName));
    toast({ title: 'Skill Removed', description: 'Skill removed from your profile. Remember to save your profile.' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full max-h-[90vh] rounded-2xl p-0 overflow-hidden animate-fade-in">
        <DialogHeader className="bg-gradient-to-r from-gray-600/80 to-gray-800/90 px-4 py-3 border-b border-gray-700/50">
          <DialogTitle className="text-base font-bold text-gray-100">Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col bg-background px-4 py-3 max-h-[calc(90vh-80px)] overflow-y-auto">
          <form className="space-y-4" onSubmit={handleSave}>
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={profile.full_name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                name="role"
                value={profile.role}
                onChange={handleChange}
                className="w-full p-2 rounded-lg border border-input bg-background"
                required
              >
                {roleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Skills</Label>
              <div className="space-y-2 mb-2">
                {userSkills.length ? (
                  userSkills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted/40 rounded p-2">
                      <span className="font-semibold">{skill}</span>
                      <Button size="sm" variant="destructive" onClick={() => handleRemoveSkill(skill)} type="button">Remove</Button>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground text-sm">No skills added yet.</div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  value={newSkill.skill_name}
                  onChange={e => setNewSkill((prev) => ({ ...prev, skill_name: e.target.value }))}
                  className="bg-background text-foreground border-input focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Enter skill name"
                />
                <Button 
                  type="button" 
                  onClick={handleAddSkill} 
                  disabled={!newSkill.skill_name.trim()} 
                  className="px-3 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Skill
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="hourly_rate">Hourly Rate (USD)</Label>
              <Input
                id="hourly_rate"
                name="hourly_rate"
                type="number"
                min="0"
                step="0.01"
                value={profile.hourly_rate}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={profile.location}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                className="w-full p-2 rounded-lg border border-input bg-background"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input
                id="avatar_url"
                name="avatar_url"
                value={profile.avatar_url}
                onChange={handleChange}
              />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;