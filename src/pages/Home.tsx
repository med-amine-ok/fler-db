import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, ArrowRight, CheckCircle2, TrendingUp, Loader2 } from 'lucide-react';
import { mockTeams } from '../lib/mockData';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import type { Event } from '../lib/types';

export const Home = () => {
  const navigate = useNavigate();
  /* State */
  const [stats, setStats] = useState({
    contactCount: 0,
    eventCount: 0,
    completionRate: 0
  });
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [teams, setTeams] = useState(mockTeams);
  const [loading, setLoading] = useState(true);

  const EVENT_LOGOS: Record<string, string> = {
    'AEC': '/AEC.png',
    'Polymaze': '/polymaze.png',
    'Charity': '/charity.png',
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Stats & Completion Rate
      const { count: contactCount } = await supabase.from('companies').select('*', { count: 'exact', head: true });
      const { count: signedCount } = await supabase.from('companies').select('*', { count: 'exact', head: true }).eq('status', 'contacted');
      const { count: eventCount } = await supabase.from('events').select('*', { count: 'exact', head: true });
      
      const completionRate = contactCount ? Math.round(((signedCount || 0) / contactCount) * 100) : 0;

      // 2. Fetch Recent Events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      // 3. Fetch Team Member Counts (from profiles)
      // Assuming 'team' column in profiles stores either the Team ID or Team Name
      const { data: profiles } = await supabase.from('profiles').select('team');
      
      const counts: Record<string, number> = {};
      if (profiles) {
         profiles.forEach((p: any) => {
             if (p.team) {
                 counts[p.team] = (counts[p.team] || 0) + 1;
             }
         });
      }

      // Update states
      setStats({
        contactCount: contactCount || 0,
        eventCount: eventCount || 0,
        completionRate
      });

      if (eventsData) {
         setRecentEvents((eventsData as any[]).map(e => ({
            id: e.id,
            name: e.name,
            date: e.created_at,
            status: e.status as any || 'planned',
            description: '',
            logo: EVENT_LOGOS[e.name]
         })));
      }

      // Update Teams with real member counts
      setTeams(prevTeams => prevTeams.map(t => {
          // Check for count by ID ('1', '2') or Name ('Logistics', etc)
          const realCount = counts[t.id] || counts[t.name] || counts[t.name.toLowerCase()] || 0;
          return {
              ...t,
              memberCount: profiles ? realCount : t.memberCount
          };
      }));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamClick = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    if (team.name.toLowerCase() === 'logistics') {
      navigate('/teams/logistics');
    } else if (team.name.toLowerCase() === 'sponsoring') {
      navigate('/teams/sponsoring');
    } else {
      navigate(`/teams/${teamId}/report`);
    }
  };

  if (loading) {
     return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 md:space-y-8 w-full px-4 md:px-0">
      {/* Stats Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="p-4 md:p-6 relative overflow-hidden group border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users size={80} />
          </div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">Total Contacts</p>
              <h3 className="text-2xl md:text-4xl font-extrabold mt-2 text-text tracking-tighter">{stats.contactCount}</h3>
              <div className="flex items-center gap-1 mt-2 text-emerald-500 text-xs md:text-sm font-medium">
                <TrendingUp size={14} /> <span>+12% this week</span>
              </div>
            </div>
            <div className="p-2 md:p-3 bg-gradient-to-br from-primary to-blue-600 text-white rounded-lg md:rounded-xl shadow-lg shadow-primary/30 flex-shrink-0">
              <Users size={20} className="md:w-6 md:h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6 relative overflow-hidden group border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Calendar size={80} />
          </div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">Target Events</p>
              <h3 className="text-2xl md:text-4xl font-extrabold mt-2 text-text tracking-tighter">{stats.eventCount}</h3>
              <div className="flex items-center gap-1 mt-2 text-emerald-500 text-xs md:text-sm font-medium">
                <TrendingUp size={14} /> <span>On track</span>
              </div>
            </div>
            <div className="p-2 md:p-3 bg-gradient-to-br from-secondary to-teal-500 text-white rounded-lg md:rounded-xl shadow-lg shadow-secondary/30 flex-shrink-0">
              <Calendar size={20} className="md:w-6 md:h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6 relative overflow-hidden group border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl md:col-span-2 lg:col-span-1">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <CheckCircle2 size={80} />
          </div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">Completion Rate</p>
              <h3 className="text-2xl md:text-4xl font-extrabold mt-2 text-text tracking-tighter">{stats.completionRate}%</h3>
               <div className="w-full bg-gray-100 rounded-full h-1.5 md:h-2 mt-3 max-w-[120px]">
                <div className="bg-text h-1.5 md:h-2 rounded-full transition-all duration-500" style={{ width: `${stats.completionRate}%` }}></div>
               </div>
            </div>
            <div className="p-2 md:p-3 bg-text text-white rounded-lg md:rounded-xl shadow-lg shadow-gray-900/20 flex-shrink-0">
              <CheckCircle2 size={20} className="md:w-6 md:h-6" />
            </div>
          </div>
        </Card>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Teams Sections */}
        <section>
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h2 className="text-base md:text-xl font-bold flex items-center gap-2 text-text">
               Your Teams
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/teams')} className="text-xs md:text-sm">
              View all
            </Button>
          </div>
          
          <div className="space-y-3 md:space-y-4">
            {teams.map((team) => (
              <Card 
                key={team.id}
                hover
                onClick={() => handleTeamClick(team.id)}
                className="p-4 md:p-5 flex items-center justify-between group border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl cursor-pointer"
              >
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors flex-shrink-0">
                     <Users size={18} className="md:w-6 md:h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm md:text-lg text-text line-clamp-1">{team.name}</h3>
                    <p className="text-xs md:text-sm text-gray-400 line-clamp-1">{team.memberCount} Members • {team.description}</p>
                  </div>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-gray-300 group-hover:text-primary group-hover:bg-primary/5 transition-all flex-shrink-0">
                   <ArrowRight size={18} className="md:w-5 md:h-5" />
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Events Sections */}
        <section>
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h2 className="text-base md:text-xl font-bold flex items-center gap-2 text-text">
               Ongoing Events
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/events')} className="text-xs md:text-sm">
              View all
            </Button>
          </div>

          <div className="space-y-3 md:space-y-4">
             {recentEvents.length > 0 ? recentEvents.map((event) => (
              <Card key={event.id} className="p-4 md:p-5 flex items-center gap-3 md:gap-4 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                 <div className="h-12 w-12 md:h-14 md:w-14 rounded-lg md:rounded-xl shrink-0 bg-white border border-gray-100 overflow-hidden flex items-center justify-center p-1">
                   {event.logo ? (
                      <img src={event.logo} alt={event.name} className="w-full h-full object-contain" />
                   ) : (
                      <span className="font-bold text-gray-300 text-xs text-center leading-tight">{event.name.substring(0,2).toUpperCase()}</span>
                   )}
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1 md:mb-2">
                       <h4 className="font-bold text-text truncate text-sm md:text-base">{event.name}</h4>
                       <Badge variant={event.status === 'ongoing' ? 'default' : 'success'} className="scale-75 md:scale-90 whitespace-nowrap">
                         {event.status}
                       </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                       <p className="text-xs md:text-sm text-gray-400 truncate">Mab9ach Mab9ach</p>
                       <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 md:h-8 px-2 md:px-3 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/events/${event.id}/dossier`);
                        }}
                       >
                         DS
                       </Button>
                    </div>
                 </div>
              </Card>
            )) : (
                <div className="text-center py-8 md:py-10 text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-xs md:text-sm">No events found. Start by creating one!</p>
                </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
