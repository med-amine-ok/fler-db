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
    <div className="w-full space-y-6 md:space-y-8 animate-fade-in">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary via-blue-500 to-secondary p-6 md:p-12 text-white shadow-lg md:shadow-xl">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-12">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white/20 backdrop-blur border-2 border-white/30 flex items-center justify-center text-white text-3xl md:text-5xl font-bold shadow-2xl">
              {profile.full_name?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase()}
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left w-full">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-3 mb-3 md:mb-2">
              <h1 className="text-2xl md:text-5xl font-bold line-clamp-2">{profile.full_name || 'User Profile'}</h1>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Edit2 size={20} />
                </button>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-3 mt-3 md:mt-4">
              <span className="flex items-center gap-2 text-white/90 text-xs md:text-sm font-medium break-all">
                <Mail size={16} /> {profile.email}
              </span>
              {profile.team && (
                <span className="flex items-center gap-2 text-white/90 text-xs md:text-sm font-medium px-3 py-1 bg-white/20 rounded-full">
                  <Shield size={16} /> {profile.team.charAt(0).toUpperCase() + profile.team.slice(1)} Team
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Left Column: Profile Info */}
        <div className="lg:col-span-1 space-y-6 md:space-y-7">
          {/* Personal Information Card */}
          <Card className="p-6 md:p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-gradient-to-br from-white via-gray-50 to-white">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h3 className="text-base md:text-lg font-bold text-text flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-primary" />
                </div>
                <span className="hidden sm:inline">Profile Info</span>
              </h3>
              {isEditing && (
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-2 hover:bg-gray-200 rounded-xl transition-all duration-200"
                >
                  <X size={18} className="text-gray-600" />
                </button>
              )}
            </div>
            
            <div className="space-y-5 md:space-y-6">
              {isEditing ? (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-2 md:mb-3 uppercase tracking-wider">Full Name</label>
                    <Input 
                      value={editForm.full_name} 
                      onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter full name"
                      className="rounded-xl border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-2 md:mb-3 uppercase tracking-wider">Phone Number</label>
                    <Input 
                      value={editForm.phone_number} 
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone_number: e.target.value }))}
                      placeholder="+1 (555) 000-0000"
                      className="rounded-xl border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <Button 
                    onClick={handleUpdateProfile}
                    className="w-full mt-4 md:mt-6 gap-2 bg-gradient-to-r from-primary to-blue-600 hover:shadow-lg rounded-xl"
                  >
                    <Save size={16} /> Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <div className="pb-5 md:pb-6 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</p>
                    <p className="text-base md:text-lg font-semibold text-text">{profile.full_name || '—'}</p>
                  </div>
                  <div className="pb-5 md:pb-6 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone</p>
                    <p className="text-base md:text-lg font-semibold text-text break-all">{profile.phone_number || '—'}</p>
                  </div>
                  <div className="pb-5 md:pb-6 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Team</p>
                    <Badge variant={profile.team === 'logistics' ? 'default' : 'success'} className="capitalize rounded-lg text-xs md:text-sm">
                      {profile.team || 'Unassigned'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Joined</p>
                    <p className="text-base md:text-lg font-semibold text-text">{new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </div>
                </>
              )}
            </div>
          </Card>

         
        </div>

        {/* Right Column: Statistics */}
        <div className="lg:col-span-1 space-y-4 md:space-y-6">
          {/* Score Card */}
          <Card className="p-6 md:p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white">
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm md:text-base font-semibold opacity-90 uppercase tracking-wider">Current Score</h3>
                <Award size={20} className="md:w-6 md:h-6 opacity-80" />
              </div>
              <p className="text-4xl md:text-5xl lg:text-6xl font-bold">{currentScore}</p>
              <p className="text-xs md:text-sm opacity-80">Based on your contact activities</p>
            </div>
          </Card>

          {/* Activity Count Card */}
            <Card className="p-6 md:p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-gradient-to-br from-secondary via-emerald-500 to-teal-600 text-white">
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs md:text-sm font-bold opacity-90 uppercase tracking-wider">Total Activities</h3>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <CalendarIcon size={18} className="md:w-6 md:h-6 opacity-90" />
                  </div>
                </div>
                <p className="text-4xl md:text-5xl lg:text-6xl font-bold">{activities.length}</p>
                <p className="text-xs md:text-sm opacity-85">Contact records created</p>
              </div>
            </Card>
        </div>
      </div>

      {/* Recent Activities Card - Full Width */}
      <Card className="p-6 md:p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
        <h3 className="text-base md:text-lg font-bold text-text mb-6 md:mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center flex-shrink-0">
            <CalendarIcon size={18} className="md:w-5 md:h-5 text-secondary" />
          </div>
          <span className="hidden sm:inline">Recent Activities</span>
          <span className="sm:hidden">Activities</span>
        </h3>
        
        {activities.length === 0 ? (
          <div className="text-center py-12 md:py-16 text-gray-400">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Award size={32} className="md:w-10 md:h-10 opacity-40" />
            </div>
            <p className="font-semibold text-gray-600 text-sm md:text-base">No activities recorded yet</p>
            <p className="text-xs md:text-sm mt-2 text-gray-500">Start making contacts to build your ranking</p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4 max-h-[400px] md:max-h-[500px] overflow-y-auto">
            {activities.map((activity, index) => (
              <div key={activity.id} className="flex items-start gap-3 md:gap-4 p-4 md:p-5 bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-xl md:rounded-2xl border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all duration-200 group">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-bold text-xs md:text-sm group-hover:shadow-md transition-all duration-200">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-bold text-text line-clamp-1 md:line-clamp-none">
                    <span className="capitalize text-primary">{activity.contact_method}</span>
                    {' '}
                    <span className="text-gray-400 hidden sm:inline">•</span>
                    {' '}
                    <span className="capitalize text-gray-600">{activity.source}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1 md:mt-1.5 font-medium line-clamp-1 md:line-clamp-none">
                    {new Date(activity.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    {' '}
                    <span className="text-gray-400 hidden sm:inline">•</span>
                    {' '}
                    {new Date(activity.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 whitespace-nowrap rounded-lg font-bold text-xs md:text-sm flex-shrink-0">
                  + pts
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

