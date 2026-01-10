import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Search, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

export const SponsoringDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*, profiles(full_name)')
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

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <button 
            onClick={() => navigate('/teams/sponsoring')}
            className="flex items-center gap-2 text-gray-500 hover:text-text mb-2 transition-colors"
          >
            <ArrowLeft size={18} /> Back to Events (Optional)
          </button>
          <h1 className="text-3xl font-bold text-text">Sponsoring Database</h1>
          <p className="text-gray-500">Manage all companies and sponsorships.</p>
        </div>
        <button 
          onClick={() => navigate(`/teams/sponsoring/global/add`)} 
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Add Company
        </button>
      </div>

      <div className="glass-card">
         <div className="p-4 border-b border-gray-100 flex gap-4">
           <div className="relative flex-1">
             <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
             <input 
               type="text" 
               placeholder="Search companies..." 
               className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">
             <Filter size={18} />
           </button>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="text-left py-4 px-6 font-semibold text-gray-500 text-sm">Company Name</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-500 text-sm">Status</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-500 text-sm">Contact Method</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-500 text-sm">Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 font-medium text-text">{item.name}</td>
                <td className="py-4 px-6">
                  <span className={clsx(
                    "px-2.5 py-1 rounded-full text-xs font-semibold capitalize",
                    item.status === 'signed' ? 'bg-green-100 text-green-700' :
                    item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  )}>
                    {item.status || 'Pending'}
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-500 capitalize">{item.contact_method || '-'}</td>
                <td className="py-4 px-6 text-gray-500">{item.profiles?.full_name || 'Unassigned'}</td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400">No companies found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
