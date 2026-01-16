import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Database as DatabaseIcon, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Sheet } from '../components/ui/Sheet';
import { supabase } from '../lib/supabase';

type Tab = 'Companies' | 'Hotels' | 'Goodies' | 'Foods';

export const Database = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('Companies');
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical' | 'status' | 'event'>('newest');

  const tabs: Tab[] = [ 'Companies', 'Hotels', 'Goodies', 'Foods'];

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    let query: any;
    
    try {
        switch(activeTab) {
            
            case 'Companies':
                query = supabase.from('companies').select('*, profiles(full_name), events(name)').order('created_at', { ascending: false });
                break;
            case 'Hotels':
                query = supabase.from('logistics').select('*, profiles(full_name)').eq('type', 'hotel').order('created_at', { ascending: false });
                break;
            case 'Foods':
                query = supabase.from('logistics').select('*, profiles(full_name)').eq('type', 'food').order('created_at', { ascending: false });
                break;
            case 'Goodies':
                query = supabase.from('logistics').select('*, profiles(full_name)').eq('type', 'goodies').order('created_at', { ascending: false });
                break;
            
            default:
                setLoading(false);
                return;
        }

        const { data: result, error } = await query;
        if (error) throw error;
        setData(result || []);

    } catch (e) {
        console.error("Error fetching database:", e);
    } finally {
        setLoading(false);
    }
  };

  const filteredData = data.filter(item => 
    JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    switch (sortBy) {
        case 'newest':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'alphabetical':
            return (a.name || '').localeCompare(b.name || '');
        case 'status':
            return (a.status || '').localeCompare(b.status || '');
        case 'event':
            // Prioritize event name for companies, fallback to type or empty for others
            const eventA = a.events?.name || a.type || '';
            const eventB = b.events?.name || b.type || '';
            return eventA.localeCompare(eventB);
        default:
            return 0;
    }
  });

  const handleAdd = () => {
      // Redirect to specific add forms based on tab
      if (activeTab === 'Companies') navigate('/teams/sponsoring/global/add');
      else if (['Hotels', 'Foods', 'Goodies'].includes(activeTab)) navigate('/teams/logistics/add');
      else navigate(`/database/add?type=${activeTab}`);
  };

  const renderTableHeaders = () => {
    const commonClasses = "text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-gray-500 text-xs md:text-xs uppercase tracking-wider whitespace-nowrap";
    
    if (activeTab === 'Companies') {
      return (
        <tr className="bg-gray-50/50 border-b border-gray-100">
          <th className={commonClasses}>Company</th>
          <th className={commonClasses}>Event</th>
          <th className={commonClasses}>Status</th>
          <th className={commonClasses}>Method</th>
          
          <th className={commonClasses}>Assigned</th>
        </tr>
      );
    }
    
    // Logistics (Hotels, Foods, Goodies)
    return (
      <tr className="bg-gray-50/50 border-b border-gray-100">
        <th className={commonClasses}>Name</th>
        <th className={commonClasses}>Status</th>
        <th className={commonClasses}>Type</th>
        <th className={commonClasses}>Contact</th>
        <th className={commonClasses}>Assigned</th>
      </tr>
    );
  };

  const renderTableRows = () => {
    if (loading) {
        return (
            <tr>
                <td colSpan={6} className="text-center py-12 md:py-16">
                    <Loader2 className="animate-spin mx-auto text-primary" size={30} />
                </td>
            </tr>
        )
    }

    if (filteredData.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="text-center py-12 md:py-16 text-gray-400">
             <div className="flex flex-col items-center gap-2">
                <DatabaseIcon size={40} className="opacity-20" />
                <p className="text-xs md:text-sm">No records found for {activeTab}</p>
             </div>
          </td>
        </tr>
      );
    }

    const rowClasses = "border-b border-gray-50 hover:bg-gray-50/80 transition-colors group";
    const cellClasses = "py-3 md:py-4 px-3 md:px-6 text-xs md:text-sm text-gray-600 group-hover:text-gray-900";

   
    if (activeTab === 'Companies') {
      return (filteredData as any[]).map((item) => (
         <tr key={item.id} className={rowClasses}>
            <td className={clsx(cellClasses, "font-medium text-text whitespace-nowrap")}>{item.name}</td>
            <td className={clsx(cellClasses, "whitespace-nowrap")}>{item.events?.name || <span className="text-gray-300 italic">-</span>}</td>
            <td className={clsx(cellClasses, "whitespace-nowrap")}>
              <Badge variant={
                item.status === 'contacted' ? 'success' : 
                item.status === 'rejected' ? 'error' : 'default'
              } className="text-xs">
                {item.status || 'Pending'}
              </Badge>
            </td>
            <td className={clsx(cellClasses, "capitalize whitespace-nowrap")}>{item.contact_method || '-'}</td>
             {/* <td className={clsx(cellClasses, "whitespace-nowrap")}>{item.contact || '-'}</td> */}
            <td className={clsx(cellClasses, "whitespace-nowrap")}>{item.profiles?.full_name || <span className="text-gray-300 italic">Unassigned</span>}</td>
            
         </tr>
      ));
    }

   

    // Logistics
    return (filteredData as any[]).map((item) => (
         <tr key={item.id} className={rowClasses}>
            <td className={clsx(cellClasses, "font-medium text-text whitespace-nowrap")}>{item.name}</td>
            <td className={clsx(cellClasses, "whitespace-nowrap")}>
               <Badge variant={item.status === 'booked' ? 'success' : item.status === 'available' ? 'default' : 'warning'} className="text-xs">
                {item.status || 'Pending'}
               </Badge>
            </td>
            <td className={clsx(cellClasses, "capitalize whitespace-nowrap")}>{item.type}</td>
            <td className={clsx(cellClasses, "whitespace-nowrap")}>{item.contact || '-'}</td>
            <td className={clsx(cellClasses, "whitespace-nowrap")}>{item.profiles?.full_name || <span className="text-gray-300 italic">Unassigned</span>}</td>
         </tr>
    ));
  }

  const renderMobileCards = () => {
    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;
    }

    if (filteredData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <DatabaseIcon size={40} className="opacity-20 mb-2" />
                <p className="text-sm">No records found for {activeTab}</p>
            </div>
        );
    }

    return (filteredData as any[]).map((item) => (
      <Card key={item.id} className="p-4 flex flex-col gap-3 group border-0 shadow-sm hover:shadow-md transition-all rounded-xl">
        <div className="flex items-start justify-between gap-2">
            <div>
                <h3 className="font-bold text-text text-base">{item.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{item.events?.name || item.type || 'General'}</p>
            </div>
            <Badge variant={
                (item.status === 'signed' || item.status === 'booked') ? 'success' : 
                (item.status === 'rejected') ? 'error' : 'default'
            } className="scale-90 origin-right">
                {item.status || 'Pending'}
            </Badge>
        </div>

        <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-sm text-gray-600 border-t border-gray-50 pt-3">
             {activeTab === 'Companies' ? (
                <>
                   <div className="flex flex-col">
                       <span className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">Method</span>
                       <span className="capitalize">{item.contact_method || '-'}</span>
                   </div>
                   {/* <div className="flex flex-col text-right">
                       <span className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">Contact</span>
                       <span className="truncate">{item.contact || '-'}</span>
                   </div> */}
                </>
             ) : (
                <>
                   <div className="flex flex-col">
                       <span className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">Type</span>
                       <span className="capitalize">{item.type || '-'}</span>
                   </div>
                   {/* <div className="flex flex-col text-right">
                       <span className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">Contact</span>
                       <span className="truncate">{item.contact || '-'}</span>
                   </div> */}
                </>
             )}
             <div className="col-span-2 flex flex-col mt-1">
                  <span className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">Assigned To</span>
                  <div className="flex items-center gap-2 mt-1">
                      <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                          {(item.profiles?.full_name || 'U').charAt(0)}
                      </div>
                      <span className="text-sm font-medium">{item.profiles?.full_name || 'Unassigned'}</span>
                  </div>
             </div>
        </div>

        {/* <Button size="sm" variant="outline" className="w-full mt-2 h-9 text-xs">
            View Details
        </Button> */}
      </Card>
    ));
  };

  return (
    <div className="space-y-4 md:space-y-6 w-full px-4 md:px-0">
      <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1 md:space-y-2">
           <h1 className="text-2xl md:text-4xl font-bold text-text tracking-tight">Database</h1>
          
        </div>
        <div className="flex gap-2 md:gap-3 w-full md:w-auto flex-wrap">
           <Button onClick={handleAdd} className="gap-2 shadow-lg shadow-primary/25 text-xs md:text-base flex-1 md:flex-none rounded-lg md:rounded-xl">
              <Plus size={16} className="md:w-5 md:h-5" /> <span className="hidden sm:inline">Add</span> <span className="sm:hidden">New</span>
           </Button>
        </div>
      </div>

      <Card className="flex flex-col min-h-[60vh] md:min-h-[70vh] border-0 shadow-lg rounded-2xl overflow-hidden bg-transparent md:bg-white shadow-none md:shadow-lg">
        {/* Toolbar */}
        <div className="p-0 md:p-5 border-none md:border-b border-gray-100 flex flex-col gap-4 md:gap-6 justify-between bg-transparent md:bg-white mb-4 md:mb-0">
          <div className="flex gap-1 p-1.5 bg-gray-100 md:bg-gray-50 rounded-xl overflow-x-auto max-w-full hide-scrollbar">
             {tabs.map(tab => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={clsx(
                   "px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0",
                   activeTab === tab ? "bg-white text-text shadow-sm" : "text-gray-500 hover:text-text hover:bg-gray-200/50"
                 )}
               >
                 {tab}
               </button>
             ))}
          </div>

          <div className="flex gap-2 md:gap-3 w-full flex-col md:flex-row">
             <div className="relative flex-1">
               <Search className="absolute left-3 top-2.5 md:top-3 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
               <input 
                 type="text" 
                 placeholder="Search..." 
                 className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-xs md:text-sm transition-all shadow-sm md:shadow-none"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
             <Button 
               variant="outline" 
               className="px-3 border-gray-200 rounded-xl bg-white shadow-sm md:shadow-none"
               onClick={() => setIsFilterOpen(true)}
             >
               <Filter size={16} className="md:w-5 md:h-5" />
             </Button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto flex-1">
          <table className="w-full min-w-fit">
            <thead>
              {renderTableHeaders()}
            </thead>
            <tbody>
              {renderTableRows()}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards Layout */}
        <div className="md:hidden space-y-3 pb-20">
            {renderMobileCards()}
        </div>
        
        {/* Pagination (Desktop Only for now) */}
        <div className="hidden md:flex p-3 md:p-4 border-t border-gray-100 flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-0 bg-gray-50/30">
          <span className="text-xs md:text-sm text-gray-500 font-medium">Showing <span className="text-text">{filteredData.length > 0 ? 1 : 0}-{filteredData.length > 10 ? 10 : filteredData.length}</span> of <span className="text-text">{filteredData.length}</span></span>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" disabled className="flex-1 sm:flex-none text-xs md:text-sm rounded-lg">Prev</Button>
            <Button variant="outline" size="sm" disabled className="flex-1 sm:flex-none text-xs md:text-sm rounded-lg">Next</Button>
          </div>
        </div>
      </Card>

       <Sheet isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filters">
          <div className="space-y-6">
              <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
                  <div className="flex gap-2 flex-wrap">
                      <Button 
                        variant={sortBy === 'newest' ? 'primary' : 'outline'} 
                        size="sm" 
                        onClick={() => setSortBy('newest')}
                        className="rounded-full"
                      >
                        Newest
                      </Button>
                      <Button 
                        variant={sortBy === 'oldest' ? 'primary' : 'outline'} 
                        size="sm" 
                        onClick={() => setSortBy('oldest')}
                        className="rounded-full"
                      >
                        Oldest
                      </Button>
                      <Button 
                        variant={sortBy === 'alphabetical' ? 'primary' : 'outline'} 
                        size="sm" 
                        onClick={() => setSortBy('alphabetical')}
                        className="rounded-full"
                      >
                        A-Z
                      </Button>
                      <Button 
                        variant={sortBy === 'status' ? 'primary' : 'outline'} 
                        size="sm" 
                        onClick={() => setSortBy('status')}
                        className="rounded-full"
                      >
                        Status
                      </Button>
                      <Button 
                        variant={sortBy === 'event' ? 'primary' : 'outline'} 
                        size="sm" 
                        onClick={() => setSortBy('event')}
                        className="rounded-full"
                      >
                        Event/Type
                      </Button>
                  </div>
              </div>

               <div className="pt-4 mt-auto">
                  <Button className="w-full" onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
               </div>
          </div>
       </Sheet>
    </div>
  );
};
