import { useEffect, useState } from 'react';
import { Mail, Shield, User, Award, Calendar as CalendarIcon, Edit2, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import type { Database } from '../lib/database.types';

type ProfileRecord = Database['public']['Tables']['profiles']['Row'];
type ActivityRecord = Database['public']['Tables']['activities']['Row'];

const POINTS = {
  call: 6,
  email: 3,
  linkedin: 4,
  outing: 10,
};

export const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone_number: '',
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('No authenticated user found.');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }
      
      if (profileData) {
        const typedProfile = profileData as unknown as ProfileRecord;
        setProfile(typedProfile);
        setEditForm({
          full_name: typedProfile.full_name || '',
          phone_number: typedProfile.phone_number || '',
        });
      }

      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (activitiesError) {
         console.warn('Activities fetch error (non-critical):', activitiesError);
      }
      const fetchedActivities = (activitiesData || []) as unknown as ActivityRecord[];
      setActivities(fetchedActivities);

    } catch (err: any) {
      console.error('Error fetching profile data:', err);
      setError(err.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = () => {
    return profile?.ranking || 0;
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;
    try {
      const { error } = await (supabase
        .from('profiles') as any)
        .update({
          full_name: editForm.full_name,
          phone_number: editForm.phone_number,
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      setProfile({ ...profile, ...editForm });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile || error) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-red-500 font-bold text-xl">Unable to load profile</div>
        {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg max-w-lg mx-auto border border-red-200">{error}</div>}
        <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
      </div>
    );
  }

  const currentScore = calculateScore();

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-blue-500 to-secondary p-8 md:p-12 text-white shadow-xl">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-2xl bg-white/20 backdrop-blur border-2 border-white/30 flex items-center justify-center text-white text-5xl font-bold shadow-2xl">
              {profile.full_name?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase()}
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
              <h1 className="text-4xl md:text-5xl font-bold">{profile.full_name || 'User Profile'}</h1>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Edit2 size={20} />
                </button>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 mt-4">
              <span className="flex items-center gap-2 text-white/90 text-sm font-medium">
                <Mail size={16} /> {profile.email}
              </span>
              {profile.team && (
                <span className="hidden md:flex items-center gap-2 text-white/90 text-sm font-medium px-3 py-1 bg-white/20 rounded-full">
                  <Shield size={16} /> {profile.team.charAt(0).toUpperCase() + profile.team.slice(1)} Team
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Profile Info */}
        <div className="lg:col-span-1 space-y-7">
          {/* Personal Information Card */}
          <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-text flex items-center gap-2">
                <User size={20} className="text-primary" />
                Profile Info
              </h3>
              {isEditing && (
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={18} className="text-gray-400" />
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-2">Full Name</label>
                    <Input 
                      value={editForm.full_name} 
                      onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-2">Phone Number</label>
                    <Input 
                      value={editForm.phone_number} 
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone_number: e.target.value }))}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <Button 
                    onClick={handleUpdateProfile}
                    className="w-full mt-4 gap-2"
                  >
                    <Save size={16} /> Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <div className="pb-4 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full Name</p>
                    <p className="text-base font-semibold text-text">{profile.full_name || '—'}</p>
                  </div>
                  {/* <div className="pb-4 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</p>
                    <p className="text-base font-semibold text-text break-all">{profile.email}</p>
                  </div> */}
                  <div className="pb-4 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                    <p className="text-base font-semibold text-text">{profile.phone_number || '—'}</p>
                  </div>
                  <div className="pb-4 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Team</p>
                    <Badge variant={profile.team === 'logistics' ? 'default' : 'success'} className="capitalize">
                      {profile.team || 'Unassigned'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Joined</p>
                    <p className="text-base font-semibold text-text">{new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"></p>
                    
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Points System Card */}
          {/* <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-gray-50 to-white">
            <h3 className="text-lg font-bold text-text mb-5 flex items-center gap-2">
              <Award size={20} className="text-amber-500" />
              Points System
            </h3>
            <div className="space-y-3">
              {Object.entries(POINTS).map(([method, points]) => (
                <div key={method} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                  <span className="text-sm font-semibold text-gray-700 capitalize">{method}</span>
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {points}
                  </span>
                </div>
              ))}
            </div>
          </Card> */}
        </div>

        {/* Right Column: Statistics & Activities */}
        <div className="lg:col-span-1 space-y-6">
          {/* Score Card */}
          <Card className="p-8 border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-primary to-blue-600 text-white">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold opacity-90">Current Score</h3>
                <Award size={24} className="opacity-80" />
              </div>
              <p className="text-5xl md:text-6xl font-bold">{currentScore}</p>
              <p className="text-sm opacity-80">Based on your contact activities</p>
            </div>
          </Card>

          {/* Recent Activities Card */}
          <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-bold text-text mb-6 flex items-center gap-2">
              <CalendarIcon size={20} className="text-secondary" />
              Recent Activities
            </h3>
            
            {activities.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Award size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No activities recorded yet</p>
                <p className="text-sm mt-1">Start making contacts to build your ranking</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {activities.map((activity, index) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:border-primary/20 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text">
                        <span className="capitalize">{activity.contact_method}</span>
                        {' '}
                        <span className="text-gray-500">via</span>
                        {' '}
                        <span className="capitalize text-primary font-bold">{activity.source}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        {' '}
                        at
                        {' '}
                        {new Date(activity.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Badge variant="success" className="bg-green-100 text-green-700 border-green-200 whitespace-nowrap">
                      + pts
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

