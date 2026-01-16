import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Search, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { supabase } from '../../lib/supabase';

export const LogisticsDashboard = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const { data, error } = await supabase
                .from('logistics')
                .select('*, profiles(full_name)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setResources(data || []);
        } catch (error) {
            console.error('Error fetching logistics:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredData = resources.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" size={32} /></div>;
    }

    return (
        <div className="space-y-4 md:space-y-6 px-4 md:px-0 w-full">
            <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:justify-between md:items-center">
                <div className="space-y-1 md:space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-text">Logistics Dashboard</h1>
                    <p className="text-xs md:text-sm text-gray-500">Manage hotels, transport, and materials.</p>
                </div>
                <button 
                  onClick={() => navigate('/teams/logistics/add')}
                  className="bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 text-xs md:text-base whitespace-nowrap w-full md:w-auto"
                >
                    <Plus size={16} className="md:w-5 md:h-5" /> <span className="hidden sm:inline">Add Resource</span><span className="sm:hidden">Add</span>
                </button>
            </div>

            <div className="border-0 shadow-lg rounded-2xl overflow-hidden">
                 <div className="p-4 md:p-5 border-b border-gray-100 flex flex-col md:flex-row gap-3 md:gap-4">
                   <div className="relative flex-1">
                     <Search className="absolute left-3 top-2.5 md:top-3 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                     <input 
                       type="text" 
                       placeholder="Search resources..." 
                       className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-2.5 rounded-lg md:rounded-xl border border-gray-200 focus:border-primary outline-none text-xs md:text-sm"
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                     />
                   </div>
                   <button className="p-2 md:p-2.5 border border-gray-200 rounded-lg md:rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
                     <Filter size={16} className="md:w-5 md:h-5" />
                   </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-gray-500 text-xs uppercase">Name</th>
                                <th className="hidden sm:table-cell text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-gray-500 text-xs uppercase">Type</th>
                                <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-gray-500 text-xs uppercase">Status</th>
                                <th className="hidden md:table-cell text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-gray-500 text-xs uppercase">Assigned</th>
                                <th className="hidden lg:table-cell text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-gray-500 text-xs uppercase">Contact</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item) => (
                                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                                    <td className="py-3 md:py-4 px-3 md:px-6 font-medium text-text text-xs md:text-sm">{item.name}</td>
                                    <td className="hidden sm:table-cell py-3 md:py-4 px-3 md:px-6 capitalize text-xs md:text-sm text-gray-600">{item.type}</td>
                                    <td className="py-3 md:py-4 px-3 md:px-6">
                                        <span className={clsx(
                                            "px-2 md:px-2.5 py-1 rounded-full text-xs font-semibold capitalize inline-block",
                                            item.status === 'booked' || item.status === 'available' ? 'bg-green-100 text-green-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        )}>
                                            {item.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="hidden md:table-cell py-3 md:py-4 px-3 md:px-6 text-gray-500 text-xs md:text-sm">{item.profiles?.full_name || 'Unassigned'}</td>
                                    <td className="hidden lg:table-cell py-3 md:py-4 px-3 md:px-6 text-gray-500 capitalize text-xs md:text-sm">{item.contact_method || '-'}</td>
                                </tr>
                            ))}
                             {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-400 text-xs md:text-sm">No resources found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
