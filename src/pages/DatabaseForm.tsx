import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const DatabaseForm = () => {
  const navigate = useNavigate();
  const [useParams] = useSearchParams();
  const type = useParams.get('type') || 'Companies';

  const [formData, setFormData] = useState({
    name: '',
    status: '',
    date: '',
    description: '',
    assignedTo: '',
    eventId: ''
  });

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (type === 'Companies') {
      fetchEvents();
    }
  }, [type]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('id, name, status')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setEvents(data || []);
    } catch (e) {
      console.error('Error fetching events:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`${type} Added Successfully`);
    navigate('/database');
  };

  const renderFields = () => {
    switch(type) {
      case 'Events':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
              <input type="text" required className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-primary" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" required className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-primary" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-primary bg-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="ongoing">ongoing</option>
                <option value="ongoing">Ongoing</option>
                <option value="ongoing">ongoing</option>
              </select>
            </div>
          </>
        );
      case 'Companies':
      default:
        return (
           <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input type="text" required className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-primary" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
              <select 
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-primary bg-white" 
                value={formData.eventId} 
                onChange={e => setFormData({...formData, eventId: e.target.value})}
              >
                <option value="">Select an event...</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">Which event is this contact for?</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
               <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-primary bg-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="">Select status...</option>
                <option value="contacted">Contacted</option>
                <option value="pending">Pending</option>
                <option value="signed">Signed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </>
        )
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-0">
      <button 
        onClick={() => navigate('/database')}
        className="flex items-center gap-2 text-gray-500 hover:text-text transition-colors"
      >
        <ArrowLeft size={18} /> Back to Database
      </button>

      <div className="bg-white md:glass-card rounded-xl shadow-sm border border-gray-100 p-4 md:p-8">
        <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Add New {type ? type.slice(0, -1) : 'Item'}</h1>
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {renderFields()}
          
          <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-gray-100 md:static md:bg-transparent md:border-0 md:p-0 z-10 md:z-auto pb-safe md:pb-0">
             <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg md:shadow-none">
                <Save size={18} /> Save Record
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};
