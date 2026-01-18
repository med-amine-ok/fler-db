import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { supabase } from '../../lib/supabase';
import { useState, useEffect } from 'react';

export const SponsoringEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const EVENT_LOGOS: Record<string, string> = {
    'AEC': '/AEC.png',
    'Polymaze': '/polymaze.png',
    'Charity': '/charity.png',
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, name, status')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedEvents = (data || []).map((event: any) => ({
        ...event,
        logo: EVENT_LOGOS[event.name]
      }));
      setEvents(transformedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  return (
    <div className="space-y-6 px-4 md:px-0 w-full">
      <div className="flex items-start md:items-center gap-3 md:gap-4">
        <button 
          onClick={() => navigate('/teams')}
          className="p-2 hover:bg-gray-100 rounded-lg md:rounded-full transition-colors flex-shrink-0"
        >
          <ArrowLeft size={18} className="md:w-6 md:h-6" />
        </button>
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-text">Select Event</h1>
          <p className="text-xs md:text-sm text-gray-500">Choose an event to manage its sponsoring database.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {events.map((event) => (
          <div 
            key={event.id} 
            onClick={() => navigate(`/teams/sponsoring/${event.id}`)}
            className="border-0 shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 p-5 md:p-6 rounded-2xl cursor-pointer group bg-white hover:bg-gradient-to-br hover:from-white hover:to-gray-50/50"
          >
            <div className="flex justify-between items-start mb-4 md:mb-6">
               <span className={clsx(
                 "px-2 md:px-2.5 py-1 rounded-lg md:rounded-full text-xs font-semibold uppercase tracking-wide",
                 (event.status as string) === 'planned' ? 'bg-blue-50 text-blue-600' : 
                 (event.status as string) === 'ongoing' ? 'bg-emerald-50 text-emerald-600' : 
                 (event.status as string) === 'finished' ? 'bg-gray-100 text-gray-500' : 'bg-gray-100 text-gray-500'
               )}>
                 {event.status}
               </span>
               <Calendar size={18} className="md:w-6 md:h-6 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0" />
            </div>


            <div className="flex items-center justify-between gap-1">
                <h3 className="text-lg md:text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">{event.name}</h3>
                {event.logo && <img src={event.logo} alt={event.name} className="w-20 h-20 object-contain" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
