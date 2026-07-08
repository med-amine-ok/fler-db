import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight, CheckCircle2, TrendingUp, Loader2, Sparkles, Plus, ClipboardList, Briefcase, Activity, Circle } from 'lucide-react';
import { clsx } from 'clsx';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import type { Event } from '../lib/types';

interface TaskItem {
  id: string;
  text: string;
  done: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  time: string;
  badgeText: string;
}

export const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    contactCount: 0,
    eventCount: 0,
    completionRate: 0
  });
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [totalFunds, setTotalFunds] = useState(0);

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const EVENT_LOGOS: Record<string, string> = {
    'AEC': '/AEC.png',
    'Polymaze': '/polymaze.png',
    'Charity': '/charity.png',
    'GALA': '/gala.svg',
    'STEPS': '/STEPS LOGO-01.png',
    'MasterClass': '/masterclass04.png',
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { count: contactCount } = await supabase.from('companies').select('*', { count: 'exact', head: true });
      const { count: signedCount } = await supabase.from('companies').select('*', { count: 'exact', head: true }).eq('status', 'signed');
      const { count: eventCount } = await supabase.from('events').select('*', { count: 'exact', head: true });
      
      const completionRate = contactCount ? Math.round(((signedCount || 0) / contactCount) * 100) : 0;
      setTotalFunds((signedCount || 0) * 150000);

      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      setStats({
        contactCount: contactCount || 0,
        eventCount: eventCount || 0,
        completionRate: completionRate || 0
      });

      if (eventsData && eventsData.length > 0) {
         setRecentEvents((eventsData as any[]).map(e => ({
            id: e.id,
            name: e.name,
            date: e.created_at,
            status: e.status as any || 'planned',
            description: '',
            logo: EVENT_LOGOS[e.name]
         })));
      } else {
         setRecentEvents([]);
      }

      // Fetch dynamic derived tasks
      const { data: pendingCompanies } = await supabase
        .from('companies')
        .select('id, name, status')
        .in('status', ['contacted', 'pending'])
        .limit(2);

      const { data: pendingLogistics } = await supabase
        .from('logistics')
        .select('id, name, status')
        .neq('status', 'booked')
        .limit(2);

      const derivedTasks: TaskItem[] = [];
      if (pendingCompanies) {
        (pendingCompanies as any[]).forEach(c => {
          derivedTasks.push({
            id: `company-${c.id}`,
            text: `Outreach check: ${c.name} (${c.status})`,
            done: false,
            priority: c.status === 'pending' ? 'high' : 'medium'
          });
        });
      }
      if (pendingLogistics) {
        (pendingLogistics as any[]).forEach(l => {
          derivedTasks.push({
            id: `logistic-${l.id}`,
            text: `Resolve logistic resource: ${l.name}`,
            done: false,
            priority: 'high'
          });
        });
      }
      setTasks(derivedTasks);

      // Fetch dynamic real activities
      const { data: activitiesData } = await supabase
        .from('activities')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(4);

      if (activitiesData && activitiesData.length > 0) {
        setActivities((activitiesData as any[]).map(act => ({
          id: act.id.toString(),
          user: act.profiles?.full_name || 'Team member',
          action: `updated sponsor outreach details`,
          time: new Date(act.created_at).toLocaleDateString(),
          badgeText: 'Database'
        })));
      } else {
        setActivities([]);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };



  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
  };

  if (loading) {
     return (
       <div className="flex items-center justify-center min-h-[60vh]">
         <Loader2 className="animate-spin text-primary" size={40} />
       </div>
     );
  }

  return (
    <div className="space-y-6 md:space-y-8 w-full max-w-7xl mx-auto px-4 md:px-0 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-blue-600 p-6 md:p-8 text-white shadow-xl shadow-primary/20">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <Badge className="bg-white/20 text-white border-0 hover:bg-white/30 backdrop-blur-sm px-3 py-1 font-semibold flex items-center gap-1.5 w-fit">
              <Sparkles size={12} className="fill-current animate-pulse text-yellow-300" /> FLER Platform Redesign Active
            </Badge>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">VISION & INNOVATION CLUB</h1>
            <p className="text-white/80 max-w-xl text-sm md:text-base leading-relaxed">
              Supercharge your event pipelines. Track sponsoring, manage logistics resources, and coordinate team actions in one central platform.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Button variant="outline" className="bg-white/10 text-white hover:bg-white/20 border-white/20 text-xs md:text-sm font-semibold rounded-xl h-11" onClick={setIsCommandPaletteOpen}>
              Search Command Palette (⌘K)
            </Button>
            <Button className="bg-white text-primary hover:bg-white/90 text-xs md:text-sm font-semibold rounded-xl h-11 shadow-md shadow-black/10" onClick={() => navigate('/database/add')}>
              <Plus size={16} className="mr-1.5" /> Add Lead
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Contacts KPI */}
        <Card className="p-5 md:p-6 relative overflow-hidden group border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-white">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Briefcase size={80} />
          </div>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Partnerships</p>
              <h3 className="text-3xl md:text-4xl font-black mt-2 text-text tracking-tighter">{stats.contactCount}</h3>
              <div className="flex items-center gap-1.5 mt-2.5 text-emerald-500 text-xs font-semibold">
                <TrendingUp size={14} /> <span>{totalFunds.toLocaleString()} DA raised</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-primary to-blue-600 text-white rounded-xl shadow-lg shadow-primary/30 flex-shrink-0">
              <Briefcase size={22} />
            </div>
          </div>
        </Card>

        {/* Target Events KPI */}
        <Card className="p-5 md:p-6 relative overflow-hidden group border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-white">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Calendar size={80} />
          </div>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Target Events</p>
              <h3 className="text-3xl md:text-4xl font-black mt-2 text-text tracking-tighter">{stats.eventCount}</h3>
              <div className="flex items-center gap-1.5 mt-2.5 text-emerald-500 text-xs font-semibold">
                <TrendingUp size={14} /> <span>AEC, Polymaze, GALA...</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-secondary to-teal-500 text-white rounded-xl shadow-lg shadow-secondary/30 flex-shrink-0">
              <Calendar size={22} />
            </div>
          </div>
        </Card>

        {/* Completion Rate KPI */}
        <Card className="p-5 md:p-6 relative overflow-hidden group border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-white">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <CheckCircle2 size={80} />
          </div>
          <div className="flex items-start justify-between gap-3 w-full">
            <div className="space-y-1 w-full">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sponsor Success Rate</p>
              <h3 className="text-3xl md:text-4xl font-black mt-2 text-text tracking-tighter">{stats.completionRate}%</h3>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-4 overflow-hidden">
                <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${stats.completionRate}%` }}></div>
              </div>
            </div>
            <div className="p-3 bg-text text-white rounded-xl shadow-lg shadow-gray-900/20 flex-shrink-0">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </Card>
      </section>

      {/* Main Grid: Checklist & Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Column 1: Today's Tasks */}
        <section className="lg:col-span-2 space-y-6">
         <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2 text-text">
             <Calendar className="text-primary" size={20} /> Active Event Workspaces
          </h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/events')} className="text-xs md:text-sm">
            View all workspaces <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recentEvents.map((event) => (
            <Card 
              key={event.id} 
              hover 
              onClick={() => navigate(`/events/${event.id}/dossier`)}
              className="p-5 flex items-center gap-4 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl cursor-pointer"
            >
              <div className="h-14 w-14 rounded-xl shrink-0 bg-gray-50 overflow-hidden flex items-center justify-center p-2 border border-gray-100 group-hover:border-primary/20">
                {event.logo ? (
                  <img src={event.logo} alt={event.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="font-bold text-gray-300 text-sm">{event.name.substring(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-text truncate text-base">{event.name}</h4>
                  <Badge variant={event.status === 'ongoing' ? 'default' : 'success'} className="scale-85">
                    {event.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Workspace Dashboard</span>
                  <span className="text-primary font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    Enter <ArrowRight size={10} />
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
        </section>

        {/* Column 2: Recent Activity & Teams */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-text">
             <Activity className="text-secondary" size={20} /> Recent Event Stream
          </h2>

          <Card className="p-5 md:p-6 border-0 shadow-lg rounded-2xl bg-white space-y-5">
            {activities.map((act) => (
              <div key={act.id} className="flex gap-3">
                <div className="w-1.5 h-12 rounded-full bg-primary/20 shrink-0 flex flex-col justify-end">
                  <div className="w-1.5 h-6 rounded-full bg-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{act.badgeText} • {act.time}</p>
                  <p className="text-sm font-semibold text-text mt-0.5">
                    <span className="text-primary font-bold">{act.user}</span> {act.action}
                  </p>
                </div>
              </div>
            ))}
          </Card>
        </section>
      </div>
    </div>
  );
};

// Helper state trigger
const setIsCommandPaletteOpen = () => {
  const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'k' });
  window.dispatchEvent(event);
};
