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
                query = supabase.from('companies').select('*, profiles(full_name)').order('created_at', { ascending: false });
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
    const commonClasses = "text-left py-4 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider";
    
    if (activeTab === 'Companies') {
      return (
        <tr className="bg-gray-50/50 border-b border-gray-100">
          <th className={commonClasses}>Company Name</th>
          <th className={commonClasses}>Status</th>
          <th className={commonClasses}>Contact Method</th>
          <th className={commonClasses}>Contact</th>
          <th className={commonClasses}>Assigned To</th>
          <th className="text-right py-4 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
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
        <th className={commonClasses}>Assigned To</th>
        <th className="text-right py-4 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
      </tr>
    );
  };

  const renderTableRows = () => {
    if (loading) {
        return (
            <tr>
                <td colSpan={6} className="text-center py-16">
                    <Loader2 className="animate-spin mx-auto text-primary" size={30} />
                </td>
            </tr>
        )
    }

    if (filteredData.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="text-center py-16 text-gray-400">
             <div className="flex flex-col items-center gap-2">
                <DatabaseIcon size={40} className="opacity-20" />
                <p>No records found for {activeTab}</p>
             </div>
          </td>
        </tr>
      );
    }

    const rowClasses = "border-b border-gray-50 hover:bg-gray-50/80 transition-colors group";
    const cellClasses = "py-4 px-6 text-sm text-gray-600 group-hover:text-gray-900";

   
    if (activeTab === 'Companies') {
      return (filteredData as any[]).map((item) => (
         <tr key={item.id} className={rowClasses}>
            <td className={clsx(cellClasses, "font-medium text-text")}>{item.name}</td>
            <td className={cellClasses}>
              <Badge variant={
                item.status === 'signed' ? 'success' : 
                item.status === 'rejected' ? 'error' : 'default'
              }>
                {item.status || 'Pending'}
              </Badge>
            </td>
            <td className={clsx(cellClasses, "capitalize")}>{item.contact_method || '-'}</td>
             <td className={cellClasses}>{item.contact || '-'}</td>
            <td className={cellClasses}>{item.profiles?.full_name || <span className="text-gray-300 italic">Unassigned</span>}</td>
            <td className="py-4 px-6 text-right">
              <button className="p-1.5 hover:bg-gray-200 rounded-md text-gray-400 hover:text-text transition-all">
                 <MoreHorizontal size={16} />
              </button>
            </td>
         </tr>
      ));
    }

   

    // Logistics
    return (filteredData as any[]).map((item) => (
         <tr key={item.id} className={rowClasses}>
            <td className={clsx(cellClasses, "font-medium text-text")}>{item.name}</td>
            <td className={cellClasses}>
               <Badge variant={item.status === 'booked' ? 'success' : item.status === 'available' ? 'default' : 'warning'}>
                {item.status || 'Pending'}
              </Badge>
            </td>
            <td className={clsx(cellClasses, "capitalize")}>{item.type}</td>
            <td className={cellClasses}>{item.contact || '-'}</td>
            <td className={cellClasses}>{item.profiles?.full_name || <span className="text-gray-300 italic">Unassigned</span>}</td>
            <td className="py-4 px-6 text-right">
               <button className="p-1.5 hover:bg-gray-200 rounded-md text-gray-400 hover:text-text transition-all">
                 <MoreHorizontal size={16} />
               </button>
            </td>
         </tr>
    ));
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-text tracking-tight">Database</h1>
           <p className="text-gray-500 mt-2">Manage and track all organizational resources.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="gap-2">
              <Download size={18} /> Export
           </Button>
           <Button onClick={handleAdd} className="gap-2 shadow-lg shadow-primary/25">
              <Plus size={18} /> Add {activeTab.slice(0, -1) || 'Item'}
           </Button>
        </div>
      </div>

      <Card className="flex flex-col min-h-[70vh]">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 flex flex-col xl:flex-row gap-6 justify-between items-center bg-white rounded-t-2xl">
          <div className="flex gap-1 p-1.5 bg-gray-50 rounded-xl overflow-x-auto max-w-full">
             {tabs.map(tab => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={clsx(
                   "px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap",
                   activeTab === tab ? "bg-white text-text shadow-sm" : "text-gray-500 hover:text-text hover:bg-gray-100/50"
                 )}
               >
                 {tab}
               </button>
             ))}
          </div>

          <div className="flex gap-3 w-full xl:w-auto">
             <div className="relative flex-1 xl:w-80">
               <Search className="absolute left-3 top-3 text-gray-400" size={18} />
               <input 
                 type="text" 
                 placeholder="Search records..." 
                 className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm transition-all"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
             <Button variant="outline" className="px-3 border-gray-200">
               <Filter size={18} />
             </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full">
            <thead>
              {renderTableHeaders()}
            </thead>
            <tbody>
              {renderTableRows()}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/30 rounded-b-2xl">
          <span className="text-sm text-gray-500 font-medium">Showing <span className="text-text">{filteredData.length > 0 ? 1 : 0}-{filteredData.length > 10 ? 10 : filteredData.length}</span> of <span className="text-text">{filteredData.length}</span> results</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
