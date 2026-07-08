import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, ArrowRight, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Event as EventType } from '../lib/types';

export const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const EVENT_LOGOS: Record<string, string> = {
    'AEC': '/AEC.png',
    'Polymaze': '/polymaze.png',
    'Charity': '/charity.png',
    'GALA': '/gala.svg',
    'STEPS': '/STEPS LOGO-01.png',
    'MasterClass': '/masterclass04.png',
  };

  const EVENT_COVER_GRADIENTS: Record<string, string> = {
  'AEC': 'from-slate-100 to-blue-100',
  'GALA': 'from-slate-900 to-black',
  'Polymaze': 'from-orange-50 to-amber-100',
  'Charity': 'from-rose-50 to-pink-100',
  'STEPS': 'from-gray-100 to-slate-200',
  'MasterClass': 'from-teal-900 to-slate-900',
};

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      let transformedList: EventType[] = [];
      if (data && data.length > 0) {
        transformedList = (data as any[]).map(dbEvent => ({
            id: dbEvent.id,
            name: dbEvent.name,
            date: dbEvent.created_at,
            status: dbEvent.status as any || 'planned',
            description: dbEvent.description || 'No description available.',
            logo: EVENT_LOGOS[dbEvent.name]
        }));
      }

      setEvents(transformedList);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setEvents([]);
      setError('Failed to load live events.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 w-full max-w-7xl mx-auto px-4 md:px-0 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 md:gap-6">
        <div className="space-y-1 md:space-y-2 w-full sm:flex-1">
           <h1 className="text-2xl md:text-4xl font-extrabold text-text tracking-tight">Event Workspaces</h1>
           <p className="text-sm text-gray-500">Select an event to open its dedicated dashboard, sponsorship contracts, resources, and team logs.</p>
           {error && <p className="text-xs text-orange-500 mt-1">{error}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          const gradient = EVENT_COVER_GRADIENTS[event.name] || 'from-gray-700 to-gray-500';

          return (
            <Card 
              key={event.id} 
              hover 
              onClick={() => navigate(`/events/${event.id}/dossier`)} 
              className="flex flex-col h-full overflow-hidden group border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl cursor-pointer bg-white"
            >
              <div className={`h-36 w-full bg-gradient-to-br ${gradient} relative overflow-hidden flex items-center justify-center border-b border-gray-100`}>
                {event.logo ? (
                  <img src={event.logo} alt={event.name} className="w-[40%] h-full object-contain px-2" />
                ) : (
                  <CalendarIcon size={32} className="text-white/80" />
                )}
                <div className="absolute inset-0 bg-black/5 mix-blend-overlay"></div>
                <Badge className="absolute top-4 left-4 bg-black/40 text-white border-0 hover:bg-black/50 backdrop-blur-sm px-2.5 py-1 font-semibold text-xs z-10 uppercase">
                  {event.status}
                </Badge>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg md:text-xl font-bold text-text group-hover:text-primary transition-colors line-clamp-1">{event.name}</h3>
                </div>

              

                {/* Card Footer actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center -space-x-1.5">
                    {/* Simulated team avatars for visual excellence */}
                    <div className="w-6 h-6 rounded-full bg-primary/25 border-2 border-white flex items-center justify-center text-[9px] font-bold text-primary">MA</div>
                    <div className="w-6 h-6 rounded-full bg-secondary/25 border-2 border-white flex items-center justify-center text-[9px] font-bold text-secondary">SL</div>
                    <div className="w-6 h-6 rounded-full bg-violet-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-violet-700">YF</div>
                    <span className="text-[10px] text-gray-400 font-bold ml-1.5">+8 active</span>
                  </div>

                  <Button 
                    variant="ghost"
                    size="sm"
                    className="group/btn text-xs h-8 rounded-lg text-primary font-bold hover:bg-primary/5"
                  >
                    Enter Workspace
                    <ArrowRight size={12} className="ml-1 transform group-hover/btn:translate-x-0.5 transition-transform" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
