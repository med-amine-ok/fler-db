import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MoreHorizontal, Download, Plus, Database as DatabaseIcon } from 'lucide-react';
import { mockEvents, mockCompanies } from '../lib/mockData';
import { clsx } from 'clsx';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

type Tab = 'Users' | 'Events' | 'Companies' | 'Hotels' | 'Goodies' | 'Foods';

export const Database = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('Companies');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs: Tab[] = ['Users', 'Events', 'Companies', 'Hotels', 'Goodies', 'Foods'];

  const getData = () => {
    switch(activeTab) {
      case 'Events': return mockEvents;
      case 'Companies': return mockCompanies;
      default: return [];
    }
  };

  const data = getData();

  const renderTableHeaders = () => {
    const commonClasses = "text-left py-4 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider";
    if (activeTab === 'Companies') {
      return (
        <tr className="bg-gray-50/50 border-b border-gray-100">
          <th className={commonClasses}>Company Name</th>
          <th className={commonClasses}>Status</th>
          <th className={commonClasses}>Assigned To</th>
          <th className="text-right py-4 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
        </tr>
      );
    }
    if (activeTab === 'Events') {
      return (
        <tr className="bg-gray-50/50 border-b border-gray-100">
           <th className={commonClasses}>Event Name</th>
           <th className={commonClasses}>Date</th>
           <th className={commonClasses}>Status</th>
           <th className="text-right py-4 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
        </tr>
      );
    }
    return (
      <tr className="bg-gray-50 text-left">
        <th className="py-4 px-6 text-gray-400">No View Configured</th>
      </tr>
    );
  };

  const renderTableRows = () => {
    if (data.length === 0) {
      return (
        <tr>
          <td colSpan={4} className="text-center py-16 text-gray-400">
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
      return (data as any[]).map((item) => (
         <tr key={item.id} className={rowClasses}>
            <td className={clsx(cellClasses, "font-medium text-text")}>{item.name}</td>
            <td className={cellClasses}>
              <Badge variant={
                item.status === 'signed' ? 'success' : 
                item.status === 'negotiating' ? 'warning' : 'default'
              }>
                {item.status}
              </Badge>
            </td>
            <td className={cellClasses}>{item.assignedTo || <span className="text-gray-300 italic">Unassigned</span>}</td>
            <td className="py-4 px-6 text-right">
              <button className="p-1.5 hover:bg-gray-200 rounded-md text-gray-400 hover:text-text transition-all">
                 <MoreHorizontal size={16} />
              </button>
            </td>
         </tr>
      ));
    }

    if (activeTab === 'Events') {
      return (data as any[]).map((item) => (
         <tr key={item.id} className={rowClasses}>
            <td className={clsx(cellClasses, "font-medium text-text")}>
               <div className="flex items-center gap-3">
                 {item.logo && <img src={item.logo} className="w-6 h-6 object-contain rounded-md" />}
                 {item.name}
               </div>
            </td>
             <td className={cellClasses}>{new Date(item.date).toLocaleDateString()}</td>
            <td className={cellClasses}>
               <Badge variant={item.status === 'ongoing' ? 'default' : 'success'}>
                {item.status}
              </Badge>
            </td>
            <td className="py-4 px-6 text-right">
               <button className="p-1.5 hover:bg-gray-200 rounded-md text-gray-400 hover:text-text transition-all">
                 <MoreHorizontal size={16} />
              </button>
            </td>
         </tr>
      ));
    }

    return null;
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
           <Button onClick={() => navigate(`/database/add?type=${activeTab}`)} className="gap-2 shadow-lg shadow-primary/25">
              <Plus size={18} /> Add {activeTab.slice(0, -1)}
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
          <span className="text-sm text-gray-500 font-medium">Showing <span className="text-text">1-10</span> of <span className="text-text">{data.length}</span> results</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
