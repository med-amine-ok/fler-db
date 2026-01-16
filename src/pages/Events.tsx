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
    <div className="space-y-6 md:space-y-8 w-full px-4 md:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 md:gap-6">
        <div className="space-y-1 md:space-y-2 w-full sm:flex-1">
           <h1 className="text-2xl md:text-4xl font-bold text-text tracking-tight">Events</h1>
           <p className="text-xs md:text-base text-gray-500">Chose the event you work for</p>
           {error && <p className="text-xs text-orange-500 mt-1">{error}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
        {events.map((event) => (
          <Card key={event.id} hover onClick={() => navigate(`/events/${event.id}/dossier`)} className="flex flex-col h-full overflow-hidden group border-0 shadow-lg hover:shadow-xl transition-all rounded-2xl">
            {/* Image/Logo Header Area - Smaller */}
            <div className="h-24 md:h-32 bg-gray-50 border-b border-gray-100 p-4 md:p-6 flex items-center justify-center relative">
               <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                  <Button size="sm" className="text-xs md:text-sm">View Details</Button>
               </div>
               
               {event.logo ? (
                  <img src={event.logo} className="w-full h-full object-contain drop-shadow-sm transform group-hover:scale-105 transition-transform duration-500" alt={event.name} />
               ) : (
                  <CalendarIcon size={32} className="md:w-10 md:h-10 text-gray-300" />
               )}
            </div>
            
            <div className="p-4 md:p-5 flex-1 flex flex-col">
              
              <div className="flex justify-between items-start gap-2 mb-3 md:mb-4">
                
                 <h3 className="text-base md:text-lg font-bold text-text group-hover:text-primary transition-colors line-clamp-2">{event.name}</h3>
                 <Badge variant={
                   event.status === 'ongoing' ? 'default' : 
                   event.status === 'finished' ? 'success' : 'outline'
                 } className="scale-75 md:scale-90 whitespace-nowrap">
                   {event.status}
                 </Badge>
              </div>

              <p className="text-gray-500 text-xs md:text-sm mb-4 line-clamp-2 leading-relaxed">{event.description}</p>

              <Button 
                variant="outline"
                size="sm"
                className="w-full mt-auto group/btn text-xs md:text-sm h-9 rounded-lg"
              >
                <FileText size={14} className="mr-2" />
                DS
                <ArrowRight size={14} className="ml-auto opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all text-gray-400" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
