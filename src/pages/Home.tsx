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
  const [stats, setStats] = useState({
    contactCount: 0,
    eventCount: 0,
    completionRate: 85 // Mocked for now or calculate based on status
  });
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch Stats
      const { count: contactCount } = await supabase.from('companies').select('*', { count: 'exact', head: true });
      const { count: eventCount } = await supabase.from('events').select('*', { count: 'exact', head: true });
      
      // Fetch Recent Events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      setStats({
        contactCount: contactCount || 0,
        eventCount: eventCount || 0,
        completionRate: 85
      });

      if (eventsData) {
         setRecentEvents((eventsData as any[]).map(e => ({
            id: e.id,
            name: e.name,
            date: e.created_at,
            status: e.status as any || 'planned',
            description: '',
            logo: undefined
         })));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamClick = (teamId: string) => {
    const team = mockTeams.find(t => t.id === teamId);
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Stats Overview */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users size={80} />
          </div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Contacts</p>
              <h3 className="text-4xl font-extrabold mt-2 text-text tracking-tighter">{stats.contactCount}</h3>
              <div className="flex items-center gap-1 mt-2 text-emerald-500 text-sm font-medium">
                <TrendingUp size={14} /> <span>+12% this week</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-primary to-blue-600 text-white rounded-xl shadow-lg shadow-primary/30">
              <Users size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Calendar size={80} />
          </div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Target Events</p>
              <h3 className="text-4xl font-extrabold mt-2 text-text tracking-tighter">{stats.eventCount}</h3>
              <div className="flex items-center gap-1 mt-2 text-emerald-500 text-sm font-medium">
                <TrendingUp size={14} /> <span>On track</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-secondary to-teal-500 text-white rounded-xl shadow-lg shadow-secondary/30">
              <Calendar size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <CheckCircle2 size={80} />
          </div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Completion Rate</p>
              <h3 className="text-4xl font-extrabold mt-2 text-text tracking-tighter">{stats.completionRate}%</h3>
               <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3 max-w-[100px]">
                <div className="bg-text h-1.5 rounded-full" style={{ width: `${stats.completionRate}%` }}></div>
               </div>
            </div>
            <div className="p-3 bg-text text-white rounded-xl shadow-lg shadow-gray-900/20">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </Card>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Teams Sections */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-text">
               Your Teams
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/teams')}>
              View all
            </Button>
          </div>
          
          <div className="space-y-4">
            {mockTeams.map((team) => (
              <Card 
                key={team.id}
                hover
                onClick={() => handleTeamClick(team.id)}
                className="p-5 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                     <Users size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-text">{team.name}</h3>
                    <p className="text-sm text-gray-400">{team.memberCount} Members • {team.description}</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                   <ArrowRight size={20} />
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Events Sections */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-text">
               Ongoing Events
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/events')}>
              View all
            </Button>
          </div>

          <div className="space-y-4">
             {recentEvents.length > 0 ? recentEvents.map((event) => (
              <Card key={event.id} className="p-4 flex items-center gap-4">
                 <div className="h-14 w-14 rounded-xl shrink-0 bg-white border border-gray-100 overflow-hidden flex items-center justify-center p-1">
                   {event.logo ? (
                      <img src={event.logo} alt={event.name} className="w-full h-full object-contain" />
                   ) : (
                      <span className="font-bold text-gray-300 text-xs text-center leading-tight">{event.name.substring(0,2).toUpperCase()}</span>
                   )}
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                       <h4 className="font-bold text-text truncate">{event.name}</h4>
                       <Badge variant={event.status === 'ongoing' ? 'default' : 'success'} className="scale-90">
                         {event.status}
                       </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                       <p className="text-sm text-gray-400 truncate">{new Date(event.date).toLocaleDateString()}</p>
                       <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 px-3 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/events/${event.id}/dossier`);
                        }}
                       >
                         Dossier
                       </Button>
                    </div>
                 </div>
              </Card>
            )) : (
                <div className="text-center py-10 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                    No events found. Start by creating one!
                </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
