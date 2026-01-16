import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MoreHorizontal, Download, Plus, Database as DatabaseIcon, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { supabase } from '../lib/supabase';

type Tab = 'Companies' | 'Hotels' | 'Goodies' | 'Foods';

export const Database = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('Companies');
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
  );

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
          <th className={commonClasses}>Contact</th>
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
                item.status === 'signed' ? 'success' : 
                item.status === 'rejected' ? 'error' : 'default'
              } className="text-xs">
                {item.status || 'Pending'}
              </Badge>
            </td>
            <td className={clsx(cellClasses, "capitalize whitespace-nowrap")}>{item.contact_method || '-'}</td>
             <td className={clsx(cellClasses, "whitespace-nowrap")}>{item.contact || '-'}</td>
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

  return (
    <div className="space-y-4 md:space-y-6 w-full px-4 md:px-0">
      <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1 md:space-y-2">
           <h1 className="text-2xl md:text-4xl font-bold text-text tracking-tight">Database</h1>
           <p className="text-xs md:text-base text-gray-500">Manage and track all organizational resources.</p>
        </div>
        <div className="flex gap-2 md:gap-3 w-full md:w-auto flex-wrap">
           <Button variant="outline" className="gap-2 text-xs md:text-base flex-1 md:flex-none rounded-lg md:rounded-xl">
              <Download size={16} className="md:w-5 md:h-5" /> <span className="hidden sm:inline">Export</span>
           </Button>
           <Button onClick={handleAdd} className="gap-2 shadow-lg shadow-primary/25 text-xs md:text-base flex-1 md:flex-none rounded-lg md:rounded-xl">
              <Plus size={16} className="md:w-5 md:h-5" /> <span className="hidden sm:inline">Add</span> <span className="sm:hidden">New</span>
           </Button>
        </div>
      </div>

      <Card className="flex flex-col min-h-[60vh] md:min-h-[70vh] border-0 shadow-lg rounded-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 md:p-5 border-b border-gray-100 flex flex-col gap-4 md:gap-6 justify-between bg-white">
          <div className="flex gap-1 p-1.5 bg-gray-50 rounded-lg overflow-x-auto max-w-full">
             {tabs.map(tab => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={clsx(
                   "px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap",
                   activeTab === tab ? "bg-white text-text shadow-sm" : "text-gray-500 hover:text-text hover:bg-gray-100/50"
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
                 className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-2.5 rounded-lg md:rounded-xl border border-gray-200 focus:border-primary outline-none text-xs md:text-sm transition-all"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
             <Button variant="outline" className="px-2 md:px-3 border-gray-200 rounded-lg md:rounded-xl">
               <Filter size={16} className="md:w-5 md:h-5" />
             </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1 -mx-4 md:mx-0">
          <table className="w-full min-w-fit">
            <thead>
              {renderTableHeaders()}
            </thead>
            <tbody>
              {renderTableRows()}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-3 md:p-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-0 bg-gray-50/30 rounded-b-2xl">
          <span className="text-xs md:text-sm text-gray-500 font-medium">Showing <span className="text-text">{filteredData.length > 0 ? 1 : 0}-{filteredData.length > 10 ? 10 : filteredData.length}</span> of <span className="text-text">{filteredData.length}</span></span>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" disabled className="flex-1 sm:flex-none text-xs md:text-sm rounded-lg">Prev</Button>
            <Button variant="outline" size="sm" disabled className="flex-1 sm:flex-none text-xs md:text-sm rounded-lg">Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
