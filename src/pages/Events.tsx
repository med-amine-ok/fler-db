import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Event as EventType } from '../lib/types'; // Use local UI type
import { mockEvents } from '../lib/mockData';

export const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      if (data && data.length > 0) {
        // Transform DB events to UI events (adding missing props)
        const transformed: EventType[] = (data as any[]).map(dbEvent => ({
            id: dbEvent.id,
            name: dbEvent.name,
            date: dbEvent.created_at, // Use created_at as date for now
            status: dbEvent.status as any || 'planned',
            description: 'No description available.', // Default
            logo: undefined // No logo in DB
        }));
        setEvents(transformed);
      } else {
        // Fallback to mock data if DB is empty or connection fails/returns nothing for demo
        setEvents(mockEvents); 
      }
    } catch (err: any) {
      console.error('Error fetching events:', err);
      // Fallback to mock data on error for seamless demo experience if key is invalid
      setEvents(mockEvents); 
      setError('Failed to load real events. Showing cached data.');
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
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-bold text-text tracking-tight">Events</h1>
           <p className="text-gray-500 mt-2 text-lg">Manage, track, and optimize your event portfolio.</p>
           {error && <p className="text-xs text-orange-500 mt-1">{error}</p>}
        </div>
        <Button className="shadow-lg shadow-primary/25">
          + New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <Card key={event.id} hover className="flex flex-col h-full overflow-hidden group hover:shadow-md transition-all">
            {/* Image/Logo Header Area - Smaller */}
            <div className="h-32 bg-gray-50 border-b border-gray-100 p-6 flex items-center justify-center relative">
               <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                  <Button size="sm" onClick={() => navigate(`/events/${event.id}/dossier`)}>View Details</Button>
               </div>
               
               {event.logo ? (
                  <img src={event.logo} className="w-full h-full object-contain drop-shadow-sm transform group-hover:scale-105 transition-transform duration-500" alt={event.name} />
               ) : (
                  <CalendarIcon size={40} className="text-gray-300" />
               )}
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="text-xl font-bold text-text group-hover:text-primary transition-colors">{event.name}</h3>
                 <Badge variant={
                   event.status === 'ongoing' ? 'default' : 
                   event.status === 'finished' ? 'success' : 'outline'
                 } className="scale-90">
                   {event.status}
                 </Badge>
              </div>

              <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">{event.description}</p>

              <Button 
                variant="outline"
                size="sm"
                onClick={() => navigate(`/events/${event.id}/dossier`)}
                className="w-full mt-auto group/btn text-xs h-9"
              >
                <FileText size={14} className="mr-2" />
                Dossier Sponsoring
                <ArrowRight size={14} className="ml-auto opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all text-gray-400" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
