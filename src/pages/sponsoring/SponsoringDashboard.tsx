import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Search, ArrowLeft, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const SponsoringDashboard = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [eventName, setEventName] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');

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

  const filteredData = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || c.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Calculate statistics
  const contacted = companies.filter(c => c.status === 'contacted').length;
  const pending = companies.filter(c => c.status === 'pending').length;
  const signed = companies.filter(c => c.status === 'signed').length;
  const rejected = companies.filter(c => c.status === 'rejected').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0 w-full max-w-7xl mx-auto pb-12">
      <div className="flex flex-col gap-3">
        <button 
          onClick={() => navigate('/teams/sponsoring')}
          className="flex items-center gap-1.5 text-gray-500 hover:text-text text-xs md:text-sm font-semibold transition-colors w-fit"
        >
          <ArrowLeft size={16} /> Back to Sponsoring Events
        </button>
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-text tracking-tight">{eventName} Sponsoring</h1>
            <p className="text-xs md:text-sm text-gray-500">Manage all corporate outreach, pipelines, and contracts.</p>
          </div>
          <Button 
            onClick={() => navigate(`/teams/sponsoring/${eventId}/add`)} 
            className="shadow-lg shrink-0 rounded-xl"
          >
            <Plus size={16} className="mr-1" /> Add Partner Contract
          </Button>
        </div>
      </div>

      {/* Visual Funnel Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: 'Contacted', count: contacted, color: 'border-blue-500 bg-blue-50/20 text-blue-700', value: 'contacted' },
          { name: 'Pending Review', count: pending, color: 'border-amber-500 bg-amber-50/20 text-amber-700', value: 'pending' },
          { name: 'Signed Contract', count: signed, color: 'border-emerald-500 bg-emerald-50/20 text-emerald-700', value: 'signed' },
          { name: 'Rejected', count: rejected, color: 'border-rose-500 bg-rose-50/20 text-rose-700', value: 'rejected' }
        ].map(stage => (
          <button 
            key={stage.name}
            onClick={() => setActiveFilter(activeFilter === stage.value ? 'all' : stage.value)}
            className={clsx(
              "p-4 border-l-4 rounded-xl text-left shadow-sm hover:shadow-md transition-all space-y-1 relative bg-white",
              stage.color,
              activeFilter === stage.value ? 'ring-2 ring-primary/20 scale-[1.02]' : ''
            )}
          >
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider block opacity-70">{stage.name}</span>
            <span className="text-xl md:text-2xl font-black block mt-1">{stage.count}</span>
          </button>
        ))}
      </div>

      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
        {/* Table Controls */}
        <div className="p-4 md:p-5 border-b border-gray-100 flex flex-col md:flex-row gap-3 md:gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-2.5 md:top-3.5 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search partnerships..." 
              className="w-full pl-10 pr-4 py-2.5 md:py-3 rounded-xl border border-gray-200 focus:border-primary outline-none text-xs md:text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => setActiveFilter('all')}
              className={clsx(
                "px-3 py-2 text-xs font-bold rounded-lg transition-all",
                activeFilter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              )}
            >
              All Leads
            </button>
            <button 
              onClick={() => setActiveFilter('signed')}
              className={clsx(
                "px-3 py-2 text-xs font-bold rounded-lg transition-all",
                activeFilter === 'signed' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              )}
            >
              Signed Only
            </button>
          </div>
        </div>

        {/* Table representation */}
        {filteredData.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm font-medium">No company records match the current filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead className="bg-gray-50 text-gray-400 font-bold border-b border-gray-100">
                <tr>
                  <th className="p-4 pl-6">Company</th>
                  <th className="p-4">Outreach Status</th>
                  <th className="p-4">Contact Method</th>
                  <th className="p-4 pr-6">Assigned Representative</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6 font-bold text-text">{item.name}</td>
                    <td className="p-4">
                      <Badge variant={
                        item.status === 'signed' ? 'success' :
                        item.status === 'contacted' ? 'default' :
                        item.status === 'pending' ? 'outline' : 'error'
                      } className="capitalize">
                        {item.status || 'Pending'}
                      </Badge>
                    </td>
                    <td className="p-4 text-gray-500 capitalize">{item.contact_method || 'Email'}</td>
                    <td className="p-4 pr-6 text-gray-500">{item.profiles?.full_name || 'Unassigned'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
