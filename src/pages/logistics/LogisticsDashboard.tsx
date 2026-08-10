import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Loader2, ArrowLeft, Hotel, Home, Coffee, Gift, CircleDot, X } from 'lucide-react';
import { clsx } from 'clsx';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { advancedMatch } from '../../utils/search';

export const LogisticsDashboard = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');

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

    const filteredData = resources.filter(r => {
        const matchesSearch = advancedMatch(r, searchTerm);
        const matchesStatus = activeFilter === 'all' || r.status === activeFilter;
        const matchesType = typeFilter === 'all' || r.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });


    const booked = resources.filter(r => r.status === 'booked').length;
    const available = resources.filter(r => r.status === 'available').length;
    const pending = resources.filter(r => r.status !== 'booked' && r.status !== 'available').length;

    const getResourceIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'hotel': return <Hotel size={16} className="text-blue-500" />;
            case 'salle': return <Home size={16} className="text-purple-500" />;
            case 'food': return <Coffee size={16} className="text-amber-500" />;
            case 'goodies':
            case 'goodie': return <Gift size={16} className="text-pink-500" />;
            default: return <CircleDot size={16} className="text-gray-500" />;
        }
    };

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
                  onClick={() => navigate('/home')}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-text text-xs md:text-sm font-semibold transition-colors w-fit"
                >
                  <ArrowLeft size={16} /> Back to Dashboard
                </button>
                
                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-text tracking-tight">Logistics Registry</h1>
                        <p className="text-xs md:text-sm text-gray-500">Coordinate and verify venues, accommodation, catering, and materials.</p>
                    </div>
                    <Button 
                      onClick={() => navigate('/teams/logistics/add')}
                      className="shadow-lg shrink-0 rounded-xl"
                    >
                        <Plus size={16} className="mr-1" /> Add Logistics Resource
                    </Button>
                </div>
            </div>

            {/* Quick Status Funnel */}
            <div className="grid grid-cols-3 gap-4">
                {[
                  { name: 'Booked', count: booked, color: 'border-emerald-500 bg-emerald-50/20 text-emerald-700', value: 'booked' },
                  { name: 'Available', count: available, color: 'border-blue-500 bg-blue-50/20 text-blue-700', value: 'available' },
                  { name: 'Pending Review', count: pending, color: 'border-amber-500 bg-amber-50/20 text-amber-700', value: 'pending' }
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

            {/* Main Registry Card */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
                <div className="p-4 md:p-5 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-3.5 text-gray-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Search resources, venues, contacts, details..." 
                            className="w-full pl-10 pr-9 py-2.5 md:py-3 rounded-xl border border-gray-200 focus:border-primary outline-none text-xs md:text-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Clear search"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    
                    {/* Type Filter Chips */}
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                        {['all', 'hotel', 'salle', 'food', 'goodie'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTypeFilter(t)}
                                className={clsx(
                                    "px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all whitespace-nowrap",
                                    typeFilter === t ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                )}
                            >
                                {t === 'all' ? 'All Types' : t}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredData.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-sm font-medium">No logistical resources match the current filter state.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs md:text-sm">
                            <thead className="bg-gray-50 text-gray-400 font-bold border-b border-gray-100">
                                <tr>
                                    <th className="p-4 pl-6">Resource Name</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Assigned Officer</th>
                                    <th className="p-4 pr-6">Contact / Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-medium">
                                {filteredData.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 pl-6 font-bold text-text">{item.name}</td>
                                        <td className="p-4 text-gray-500 capitalize">
                                            <span className="flex items-center gap-1.5">
                                                {getResourceIcon(item.type)}
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant={
                                                item.status === 'booked' || item.status === 'available' ? 'success' : 'default'
                                            } className="uppercase">
                                                {item.status || 'Pending'}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-gray-500">{item.profiles?.full_name || 'Unassigned'}</td>
                                        <td className="p-4 pr-6 text-gray-400 truncate max-w-xs">{item.contact || item.notes || '-'}</td>
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
