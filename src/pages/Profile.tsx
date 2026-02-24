import { useEffect, useState } from 'react';
import { Mail, Shield, User, Award, Calendar as CalendarIcon, Edit2, Save, X, Phone, UserCheck, Clock, Leaf, Zap, Flame, PhoneCall, Handshake, Briefcase, Star, Trophy, Crown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import type { Database } from '../lib/database.types';

type ProfileRecord = Database['public']['Tables']['profiles']['Row'];
type ActivityRecord = Database['public']['Tables']['activities']['Row'];

const BADGES = [
  { min: 0,    label: 'Rookie',               Icon: Leaf,      earned: 'bg-gradient-to-br from-gray-400 to-gray-500',     ring: 'ring-gray-300'   },
  { min: 100,  label: 'Starter',              Icon: Zap,       earned: 'bg-gradient-to-br from-blue-400 to-blue-600',     ring: 'ring-blue-300'   },
  { min: 200,  label: 'Active',               Icon: Flame,     earned: 'bg-gradient-to-br from-orange-400 to-orange-500', ring: 'ring-orange-300' },
  { min: 300,  label: 'Hustler',              Icon: PhoneCall, earned: 'bg-gradient-to-br from-purple-400 to-purple-600', ring: 'ring-purple-300' },
  { min: 400,  label: 'Closer',               Icon: Handshake, earned: 'bg-gradient-to-br from-red-400 to-rose-500',      ring: 'ring-red-300'    },
  { min: 600,  label: 'Pro',                  Icon: Briefcase, earned: 'bg-gradient-to-br from-cyan-400 to-cyan-600',    ring: 'ring-cyan-300'   },
  { min: 700,  label: 'Elite',                Icon: Star,      earned: 'bg-gradient-to-br from-yellow-400 to-amber-500', ring: 'ring-yellow-300' },
  { min: 850,  label: 'Legend',               Icon: Trophy,    earned: 'bg-gradient-to-br from-amber-500 to-orange-600', ring: 'ring-amber-300'  },
  { min: 1000, label: 'm3labalkch wech kayn', Icon: Crown,     earned: 'bg-gradient-to-br from-violet-500 to-pink-500',  ring: 'ring-violet-300' },
];

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

  const currentBadgeIndex = BADGES.reduce((acc, badge, i) => currentScore >= badge.min ? i : acc, 0);
  const currentBadge = BADGES[currentBadgeIndex];
  const nextBadge = BADGES[currentBadgeIndex + 1] ?? null;
  const prevMin = currentBadge.min;
  const nextMin = nextBadge?.min ?? prevMin;
  const progressPct = nextBadge
    ? Math.min(100, Math.round(((currentScore - prevMin) / (nextMin - prevMin)) * 100))
    : 100;

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
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-40">Current Badge</p>
                  <p className="text-xl font-black bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent flex items-center justify-end gap-1.5">
                    <currentBadge.Icon size={18} />
                    {currentBadge.label}
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
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Current Badge</p>
                    <p className="font-bold opacity-80 flex items-center gap-1.5">
                      <currentBadge.Icon size={14} />
                      {currentBadge.label}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Next Badge</p>
                    {nextBadge ? (
                      <p className="font-bold text-secondary flex items-center justify-end gap-1.5">
                        <nextBadge.Icon size={14} />
                        {nextBadge.label}
                      </p>
                    ) : (
                      <p className="font-bold text-secondary flex items-center justify-end gap-1.5"><Crown size={14} /> Max Tier</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full shadow-lg shadow-primary/20 transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                {nextBadge && (
                  <p className="text-[9px] font-bold opacity-40 mt-1.5 text-right">
                    {nextBadge.min - currentScore} pts to {nextBadge.label}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Badge Section - Order 3 */}
        <Card className="p-8 border border-gray-100/60 shadow-xl shadow-gray-200/20 rounded-[2rem] bg-white overflow-hidden order-3 lg:col-span-3">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-text tracking-tight">Achievements</h3>
                
              </div>
              <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl ${currentBadge.earned} text-white shadow-lg`}>
                <currentBadge.Icon size={22} />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-70">Current Badge</p>
                  <p className="text-base font-black leading-tight">{currentBadge.label}</p>
                </div>
              </div>
            </div>

            {/* Badge Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
              {BADGES.map((badge, i) => {
                const isEarned = currentScore >= badge.min;
                const isCurrent = i === currentBadgeIndex;
                return (
                  <div
                    key={i}
                    className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300 ${
                      isEarned
                        ? `${badge.earned} text-white shadow-md ring-2 ${badge.ring} ring-offset-2`
                        : 'bg-gray-50 text-gray-300 border border-gray-100'
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute -top-2 -right-2 w-4 h-4 bg-secondary rounded-full border-2 border-white shadow animate-pulse" />
                    )}
                    <badge.Icon size={22} className={isEarned ? 'opacity-100' : 'opacity-20'} />
                    <p className={`text-[8px] font-black uppercase tracking-wide text-center leading-tight ${
                      isEarned ? 'text-white/80' : 'text-gray-300'
                    }`}>{badge.label}</p>
                    <p className={`text-[7px] font-bold ${isEarned ? 'text-white/50' : 'text-gray-200'}`}>{badge.min}pts</p>
                  </div>
                );
              })}
            </div>

            {/* Progress to next badge */}
            {nextBadge ? (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <nextBadge.Icon size={13} />
                    Next: <span className="text-text">{nextBadge.label}</span>
                  </span>
                  <span className="tabular-nums">
                    <span className="text-primary font-black">{currentScore - prevMin}</span>
                    <span className="text-gray-300"> / {nextMin - prevMin} pts</span>
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-semibold text-right">{nextMin - currentScore} points to go</p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 py-3 rounded-2xl bg-gradient-to-r from-violet-50 to-pink-50 border border-violet-100">
                <Crown size={20} className="text-violet-500" />
                <p className="text-sm font-black text-violet-600 uppercase tracking-widest">Maximum tier reached — m3labalkch wech kayn!</p>
                <Crown size={20} className="text-violet-500" />
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

