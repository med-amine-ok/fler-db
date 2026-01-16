import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Filter, Search, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

export const SponsoringDashboard = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [eventName, setEventName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      fetchCompanies();
      fetchEventName();
    }
  }, [eventId]);

  const fetchEventName = async () => {
    if (!eventId) return;
    try {
      const { data, error } = await supabase
        .from('events')
        .select('name')
        .eq('id', parseInt(eventId))
        .single();

      if (error) throw error;
      setEventName((data as any)?.name || '');
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  };

  const fetchCompanies = async () => {
    if (!eventId) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*, profiles(full_name), events(id, name)')
        .eq('event_id', parseInt(eventId))
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0 w-full">
      <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:justify-between md:items-center">
        <div className="space-y-2 md:space-y-3">
          <button 
            onClick={() => navigate('/teams/sponsoring')}
            className="flex items-center gap-2 text-gray-500 hover:text-text text-xs md:text-sm transition-colors"
          >
            <ArrowLeft size={16} className="md:w-5 md:h-5" /> Back to Events
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-text line-clamp-1">{eventName}</h1>
          <p className="text-xs md:text-sm text-gray-500">Manage all companies and sponsorships for this event.</p>
        </div>
        <button 
          onClick={() => navigate(`/teams/sponsoring/${eventId}/add`)} 
          className="bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 text-xs md:text-base whitespace-nowrap w-full md:w-auto"
        >
          <Plus size={16} className="md:w-5 md:h-5" /> <span className="hidden sm:inline">Add Company</span><span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="border-0 shadow-lg rounded-2xl overflow-hidden">
         <div className="p-4 md:p-5 border-b border-gray-100 flex flex-col md:flex-row gap-3 md:gap-4">
           <div className="relative flex-1">
             <Search className="absolute left-3 top-2.5 md:top-3 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
             <input 
               type="text" 
               placeholder="Search companies..." 
               className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-2.5 rounded-lg md:rounded-xl border border-gray-200 focus:border-primary outline-none text-xs md:text-sm"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <button className="p-2 md:p-2.5 border border-gray-200 rounded-lg md:rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
             <Filter size={16} className="md:w-5 md:h-5" />
           </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-8 md:p-10"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-8 md:py-10 text-gray-400 text-xs md:text-sm">No companies found for this event</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-gray-500 text-xs uppercase">Company</th>
                  <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-gray-500 text-xs uppercase">Status</th>
                  <th className="hidden sm:table-cell text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-gray-500 text-xs uppercase">Method</th>
                  <th className="hidden md:table-cell text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-gray-500 text-xs uppercase">Assigned</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 md:py-4 px-3 md:px-6 font-medium text-text text-xs md:text-sm">{item.name}</td>
                    <td className="py-3 md:py-4 px-3 md:px-6">
                      <span className={clsx(
                        "px-2 md:px-2.5 py-1 rounded-full text-xs font-semibold capitalize inline-block",
                        item.status === 'contacted' ? 'bg-green-100 text-green-700' :
                        item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      )}>
                        {item.status || 'Pending'}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell py-3 md:py-4 px-3 md:px-6 text-gray-500 capitalize text-xs md:text-sm">{item.contact_method || '-'}</td>
                    <td className="hidden md:table-cell py-3 md:py-4 px-3 md:px-6 text-gray-500 text-xs md:text-sm">{item.profiles?.full_name || 'Unassigned'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
