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

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, name, status')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/teams')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-text">Select Event</h1>
          <p className="text-gray-500">Choose an event to manage its sponsoring database.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div 
            key={event.id} 
            onClick={() => navigate(`/teams/sponsoring/${event.id}`)}
            className="glass-card cursor-pointer group hover:shadow-lg hover:border-primary/30 transition-all duration-200 p-6"
          >
            <div className="flex justify-between items-start mb-4">
               <span className={clsx(
                 "px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide",
                 (event.status as string) === 'planned' ? 'bg-blue-50 text-blue-600' : 
                 (event.status as string) === 'ongoing' ? 'bg-emerald-50 text-emerald-600' : 
                 (event.status as string) === 'finished' ? 'bg-gray-100 text-gray-500' : 'bg-gray-100 text-gray-500'
               )}>
                 {event.status}
               </span>
               <Calendar size={20} className="text-gray-400 group-hover:text-primary transition-colors" />
            </div>

            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{event.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};
