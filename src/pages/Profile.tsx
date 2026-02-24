import { useEffect, useState } from 'react';
import { Mail, Shield, User, Award, Calendar as CalendarIcon, Edit2, Save, X, Phone, UserCheck, Clock } from 'lucide-react';
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
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

      setAvatarUrl(user.user_metadata?.avatar_url || user.user_metadata?.picture || null);

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 font-medium animate-pulse">Synchronizing your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile || error) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <X size={32} />
        </div>
        <h2 className="text-2xl font-bold text-text mb-2">Something went wrong</h2>
        <p className="text-gray-500 mb-8">{error || 'We couldn\'t load your profile information. Please check your connection and try again.'}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="px-8">
          Retry Connection
        </Button>
      </div>
    );
  }

  const currentScore = calculateScore();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Refined Header Section */}
      <div className="relative bg-white rounded-[2rem] border border-gray-100 p-8 md:p-10 shadow-sm overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-primary/10 transition-colors duration-500"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full -ml-16 -mb-16 blur-3xl group-hover:bg-secondary/10 transition-colors duration-500"></div>

        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative group/avatar">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 border-white shadow-xl object-cover"
              />
            ) : (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 border-4 border-white shadow-xl flex items-center justify-center text-primary text-3xl md:text-4xl font-black">
                {profile.full_name?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-secondary text-white p-2 rounded-xl shadow-lg border-2 border-white">
              <UserCheck size={16} />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left pt-2">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-text">
                {profile.full_name || 'User Profile'}
              </h1>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition-all font-semibold text-sm border border-gray-100 shadow-sm"
                >
                  <Edit2 size={14} />
                  Edit Profile
                </button>
              )}
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50/50 text-primary rounded-xl text-sm font-semibold border border-blue-100/50">
                <Mail size={16} />
                {profile.email}
              </div>
              {profile.team && (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50/50 text-secondary rounded-xl text-sm font-semibold border border-emerald-100/50">
                  <Shield size={16} />
                  {profile.team.charAt(0).toUpperCase() + profile.team.slice(1)} Team
                </div>
              )}
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50/50 text-gray-500 rounded-xl text-sm font-semibold border border-gray-100/50">
                <Clock size={16} />
                Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Personal Info Box - Order 1 */}
        <div className="lg:col-span-2 space-y-8 order-1">
          <Card className="p-8 md:p-10 border border-gray-100/60 shadow-xl shadow-gray-200/20 rounded-[2rem] bg-white relative overflow-hidden">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-text tracking-tight">Personal Information</h3>
                <p className="text-gray-400 text-sm font-medium">Keep your account details up to date</p>
              </div>
              {isEditing && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-2xl transition-all"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {isEditing ? (
                <div className="col-span-2 space-y-8 animate-in slide-in-from-top-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                          <User size={18} />
                        </div>
                        <Input
                          value={editForm.full_name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                          placeholder="Your full name"
                          className="pl-12 py-3.5 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-base font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                          <Phone size={18} />
                        </div>
                        <Input
                          value={editForm.phone_number}
                          onChange={(e) => setEditForm(prev => ({ ...prev, phone_number: e.target.value }))}
                          placeholder="+213 --- --- ---"
                          className="pl-12 py-3.5 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-base font-medium"
                        />
                      </div>
                    </div>
                    {/* Integrated non-editable items for context */}
                    <div className="space-y-2 opacity-60">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Assigned Team</p>
                      <div className="p-4 rounded-2xl bg-gray-100/50 border border-transparent flex items-center justify-between">
                        <p className="text-sm font-bold text-text capitalize">{profile.team || 'Unassigned'}</p>
                        <Shield size={14} className="text-gray-400" />
                      </div>
                    </div>
                    <div className="space-y-2 opacity-60">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Activity Records</p>
                      <div className="p-4 rounded-2xl bg-gray-100/50 border border-transparent flex items-center justify-between">
                        <p className="text-sm font-bold text-text">{activities.length} Logs</p>
                        <CalendarIcon size={14} className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      onClick={handleUpdateProfile}
                      className="flex-1 py-4 gap-2 bg-text hover:bg-black text-white rounded-2xl shadow-xl shadow-gray-200 text-base font-bold transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <Save size={18} /> Update Details
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="px-8 py-4 rounded-2xl font-bold"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="group space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      Full Name
                    </p>
                    <div className="p-5 rounded-2xl bg-gray-50/50 border border-gray-50 group-hover:bg-white group-hover:border-primary/20 group-hover:shadow-md transition-all duration-300">
                      <p className="text-lg font-bold text-text">{profile.full_name || '—'}</p>
                    </div>
                  </div>
                  <div className="group space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      Phone Contact
                    </p>
                    <div className="p-5 rounded-2xl bg-gray-50/50 border border-gray-50 group-hover:bg-white group-hover:border-primary/20 group-hover:shadow-md transition-all duration-300">
                      <p className="text-lg font-bold text-text break-all">{profile.phone_number || '—'}</p>
                    </div>
                  </div>
                  <div className="group space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      Assigned Team
                    </p>
                    <div className="p-5 rounded-2xl bg-gray-50/50 border border-gray-50 group-hover:bg-white group-hover:border-primary/20 group-hover:shadow-md transition-all duration-300 flex items-center justify-between">
                      <p className="text-lg font-bold text-text capitalize">{profile.team || 'Unassigned'}</p>
                      <Badge variant={profile.team === 'logistics' ? 'default' : 'success'} className="rounded-xl px-4 py-1.5 border-0 shadow-sm">
                        Active
                      </Badge>
                    </div>
                  </div>
                  <div className="group space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      Platform Activity
                    </p>
                    <div className="p-5 rounded-2xl bg-gray-50/50 border border-gray-50 group-hover:bg-white group-hover:border-primary/20 group-hover:shadow-md transition-all duration-300 flex items-center justify-between">
                      <p className="text-lg font-bold text-text">{activities.length} Recorded Logs</p>
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        <CalendarIcon size={16} />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Stats Column - Right 1/3 - Order 2 */}
        <div className="space-y-8 order-2 lg:order-2">
          {/* Ranking Card */}
          <Card className="relative p-10 bg-sidebar text-white rounded-[2.5rem] shadow-2xl shadow-sidebar/20 overflow-hidden group border-0">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors duration-500"></div>
            <div className="relative space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-inner">
                  <Award size={28} className="text-secondary" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-40">Global Ranking</p>
                  <p className="text-xl font-black bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
                    Top Contributor
                  </p>
                </div>
              </div>
              <div>
                <p className="text-6xl md:text-7xl font-black tracking-tighter mb-2 drop-shadow-sm">{currentScore}</p>
                <p className="text-sm font-bold opacity-60">Dynamic points earned through platform activity</p>
              </div>
              <div className="pt-6 border-t border-white/10">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Previous Level</p>
                    <p className="font-bold opacity-80">Rookie</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Next Reward</p>
                    <p className="font-bold text-secondary">Elite Badge</p>
                  </div>
                </div>
                <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary w-2/3 rounded-full shadow-lg shadow-primary/20"></div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Activity Section - Order 3 */}
        
      </div>
    </div>
  );
};

