import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Star } from 'lucide-react';

const PublicProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchProfile = async () => {
      setLoading(true);
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      setProfile(profileData);
      // Fetch skills
      const { data: userSkills } = await supabase
        .from('profile_skills')
        .select('*, skill:skills(name, category)')
        .eq('profile_id', id);
      setSkills(userSkills || []);
      // Fetch reviews
      const { data: reviewData } = await supabase
        .from('reviews')
        .select('*, reviewer:profiles(full_name, avatar_url)')
        .eq('reviewee_id', id)
        .order('created_at', { ascending: false });
      setReviews(reviewData || []);
      setLoading(false);
    };
    fetchProfile();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;
  if (!profile) return <div className="p-8 text-center">Profile not found.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 animate-fade-in">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback>{profile.full_name?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl font-bold">{profile.full_name}</CardTitle>
            <div className="text-muted-foreground text-sm">{profile.role}</div>
            <div className="text-muted-foreground text-sm">{profile.location}</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-2"><span className="font-semibold">Bio:</span> {profile.bio || <span className="text-muted-foreground">No bio</span>}</div>
          <div className="mb-2">
            <span className="font-semibold">Skills:</span>
            {skills.length ? (
              <span className="ml-2 flex flex-wrap gap-2">
                {skills.map((s: any) => (
                  <span key={s.id} className="bg-muted/60 text-xs px-2 py-1 rounded font-medium">
                    {s.skill?.name} ({s.proficiency_level}, {s.years_experience} yrs)
                  </span>
                ))}
              </span>
            ) : (
              <span className="ml-2 text-muted-foreground">No skills listed</span>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-muted-foreground">No reviews yet.</div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r: any) => (
                <div key={r.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-3 mb-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={r.reviewer?.avatar_url} />
                      <AvatarFallback>{r.reviewer?.full_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold">{r.reviewer?.full_name || 'Anonymous'}</span>
                    <span className="flex items-center ml-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                      ))}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">{r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{r.comment || <span className="italic">No comment</span>}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicProfile; 