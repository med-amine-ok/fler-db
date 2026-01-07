import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, FileText, ArrowRight } from 'lucide-react';
import { mockEvents } from '../lib/mockData';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const Events = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-bold text-text tracking-tight">Events</h1>
           <p className="text-gray-500 mt-2 text-lg">Manage, track, and optimize your event portfolio.</p>
        </div>
        <Button className="shadow-lg shadow-primary/25">
          + New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockEvents.map((event) => (
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
                   event.status === 'ongoing' ? 'success' : 'outline'
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
