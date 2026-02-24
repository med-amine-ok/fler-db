import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Database as DatabaseIcon, Loader2, Edit2, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Sheet } from '../components/ui/Sheet';
import { supabase } from '../lib/supabase';

type Tab = 'Companies' | 'Hotels' | 'Goodies' | 'Foods' | 'Passages';

export const Database = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('Companies');
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical' | 'status' | 'event'>('newest');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<any>(null);

  const tabs: Tab[] = ['Companies', 'Hotels', 'Goodies', 'Foods', 'Passages'];

  useEffect(() => {
    fetchData();
    getCurrentUser();
    fetchEvents();
    fetchUsers();
  }, [activeTab]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('id, name');
    setEvents(data || []);
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('id, full_name');
    setUsers(data || []);
  };

  const fetchData = async () => {
    setLoading(true);
    let query: any;

    try {
      switch (activeTab) {

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
        case 'Passages':
          query = supabase.from('logistics').select('*, profiles(full_name)').eq('type', 'passage').order('created_at', { ascending: false });
          break;

        default:
          setLoading(false);
          return;
      }

      const { data: result, error } = await query;
      if (error) throw error;
      setData(result || []);

    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem({ ...item });
    setIsEditSheetOpen(true);
  };

  const handleDelete = async (item: any) => {
    setDeletingId(item.id);
    try {
      const table = activeTab === 'Companies' ? 'companies' : 'logistics';
      const { error } = await (supabase as any).from(table).delete().eq('id', item.id);
      if (error) throw error;
      setConfirmDeleteItem(null);
      fetchData();
    } catch (error: any) {
      console.error('Error deleting record:', error);
      alert('Failed to delete record: ' + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsUpdating(true);
    try {
      const table = activeTab === 'Companies' ? 'companies' : 'logistics';
      const payload: any = {
        name: editingItem.name,
        status: editingItem.status,
        notes: editingItem.notes,
        contact: editingItem.contact,
        contact_method: editingItem.contact_method,
        assigned_user_id: editingItem.assigned_user_id,
      };

      if (activeTab === 'Companies') {
        payload.event_id = editingItem.event_id ? parseInt(editingItem.event_id) : null;
      } else {
        payload.type = editingItem.type;
      }

      const { error } = await (supabase as any)
        .from(table)
        .update(payload)
        .eq('id', editingItem.id);

      if (error) throw error;

      setIsEditSheetOpen(false);
      setEditingItem(null);
      fetchData();
    } catch (error: any) {
      console.error('Error updating record:', error);
      alert('Failed to update record: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredData = data.filter(item => {
    const matchesSearch = JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = !selectedUser || item.assigned_user_id === selectedUser;
    return matchesSearch && matchesUser;
  }).sort((a, b) => {
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
    else if (['Hotels', 'Foods', 'Goodies', 'Passages'].includes(activeTab)) navigate('/teams/logistics/add');
    else navigate(`/database/add?type=${activeTab}`);
  };

  const renderTableHeaders = () => {
    const commonClasses = "text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-gray-500 text-xs md:text-xs uppercase tracking-wider whitespace-nowrap";

    if (activeTab === 'Companies') {
      return (
        <tr className="border-b border-gray-100 bg-gray-50/50">
          <th className={clsx(commonClasses, "w-[20%]")}>Company</th>
          <th className={clsx(commonClasses, "w-[15%]")}>Event</th>
          <th className={clsx(commonClasses, "w-[12%]")}>Status</th>
          <th className={clsx(commonClasses, "w-[12%]")}>Method</th>
          <th className={clsx(commonClasses, "w-[16%]")}>Notes</th>
          <th className={clsx(commonClasses, "w-[15%]")}>Assigned</th>
          <th className={clsx(commonClasses, "w-[10%] text-right")}></th>
        </tr>
      );
    }

    // Logistics (Hotels, Foods, Goodies)
    return (
      <tr className="border-b border-gray-100 bg-gray-50/50">
        <th className={clsx(commonClasses, "w-[35%]")}>Name</th>
        <th className={clsx(commonClasses, "w-[15%]")}>Status</th>
        <th className={clsx(commonClasses, "w-[15%]")}>Type</th>
        <th className={clsx(commonClasses, "w-[25%]")}>Assigned</th>
        <th className={clsx(commonClasses, "w-[10%] text-right")}></th>
      </tr>
    );
  };

  const renderTableRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={7} className="text-center py-12 md:py-16">
            <Loader2 className="animate-spin mx-auto text-primary" size={30} />
          </td>
        </tr>
      )
    }

    if (filteredData.length === 0) {
      return (
        <tr>
          <td colSpan={7} className="text-center py-12 md:py-16 text-gray-400">
            <div className="flex flex-col items-center gap-2">
              <DatabaseIcon size={40} className="opacity-20" />
              <p className="text-xs md:text-sm">No records found for {activeTab}</p>
            </div>
          </td>
        </tr>
      );
    }

    const rowClasses = "border-b border-gray-50 hover:bg-primary/[0.02] transition-colors group";
    const cellClasses = "py-4 px-3 md:px-6 text-sm text-gray-600 transition-colors truncate";

    if (activeTab === 'Companies') {
      return (filteredData as any[]).map((item) => (
        <tr key={item.id} className={rowClasses}>
          <td className={clsx(cellClasses, "font-semibold text-gray-900")}>
            <div className="flex flex-col min-w-0">
              <span className="truncate">{item.name}</span>
              <span className="text-[10px] text-gray-400 font-normal md:hidden truncate uppercase tracking-tight">{item.profiles?.full_name || 'Unassigned'}</span>
            </div>
          </td>
          <td className={cellClasses}>
            <span className="text-gray-500 text-xs truncate block">{item.events?.name || '-'}</span>
          </td>
          <td className={cellClasses}>
            <Badge variant={
              (item.status === 'signed' || item.status === 'contacted') ? 'success' :
                item.status === 'rejected' ? 'error' :
                  (!item.status || item.status === 'pending') ? 'warning' : 'default'
            } className="text-[9.5px] uppercase font-bold tracking-tighter px-2 py-0.5">
              {item.status || 'Pending'}
            </Badge>
          </td>
          <td className={clsx(cellClasses, "capitalize text-gray-400 text-xs")}>{item.contact_method || '-'}</td>
          <td className={cellClasses}>
            <p className="line-clamp-1 text-[11px] text-gray-400 italic" title={item.notes || ''}>
              {item.notes || '-'}
            </p>
          </td>
          <td className={cellClasses}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/5 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">
                {(item.profiles?.full_name || 'U').charAt(0)}
              </div>
              <span className="truncate max-w-[80px] text-[11px] font-medium text-gray-600">
                {item.profiles?.full_name || 'Unassigned'}
              </span>
            </div>
          </td>
          <td className={clsx(cellClasses, "text-right")}>
            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {currentUser && item.assigned_user_id === currentUser.id ? (
                <>
                  <button
                    className="p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-md transition-colors"
                    onClick={() => setConfirmDeleteItem(item)}
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              ) : (
                <div className="w-7 h-7" />
              )}
            </div>
          </td>
        </tr>
      ));
    }

    // Logistics
    return (filteredData as any[]).map((item) => (
      <tr key={item.id} className={rowClasses}>
        <td className={clsx(cellClasses, "font-semibold text-gray-900")}>{item.name}</td>
        <td className={cellClasses}>
          <Badge variant={
            item.status === 'booked' ? 'success' :
              (!item.status || item.status === 'pending') ? 'warning' :
                item.status === 'available' ? 'default' : 'warning'
          } className="text-[9px] uppercase font-bold px-2 py-0.5">
            {item.status || 'Pending'}
          </Badge>
        </td>
        <td className={clsx(cellClasses, "capitalize text-gray-400 text-xs")}>{item.type}</td>
        <td className={cellClasses}>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-primary/5 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">
              {(item.profiles?.full_name || 'U').charAt(0)}
            </div>
            <span className="truncate max-w-[80px] text-[11px] font-medium text-gray-600">
              {item.profiles?.full_name || 'Unassigned'}
            </span>
          </div>
        </td>
        <td className={clsx(cellClasses, "text-right")}>
          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {currentUser && item.assigned_user_id === currentUser.id ? (
              <>
                <button
                  className="p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors"
                  onClick={() => handleEdit(item)}
                >
                  <Edit2 size={14} />
                </button>
                <button
                  className="p-1.5 text-red-400 hover:bg-red-50 rounded-md transition-colors"
                  onClick={() => setConfirmDeleteItem(item)}
                >
                  <Trash2 size={14} />
                </button>
              </>
            ) : (
              <div className="w-7 h-7" />
            )}
          </div>
        </td>
      </tr>
    ));
  };

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
            (item.status === 'signed' || item.status === 'booked' || item.status === 'contacted') ? 'success' :
              (item.status === 'rejected') ? 'error' :
                (!item.status || item.status === 'pending') ? 'warning' : 'default'
          } className="scale-90 origin-right shrink-0">
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

        {currentUser && item.assigned_user_id === currentUser.id && (
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-9 text-xs gap-2 border-primary/20 text-primary"
              onClick={() => handleEdit(item)}
            >
              <Edit2 size={14} /> Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-9 text-xs gap-2 border-red-200 text-red-400 hover:bg-red-50"
              onClick={() => setConfirmDeleteItem(item)}
            >
              <Trash2 size={14} /> Delete
            </Button>
          </div>
        )}
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
        <div className="hidden md:block flex-1">
          <table className="w-full table-fixed">
            <thead>
              {renderTableHeaders()}
            </thead>
            <tbody className="divide-y divide-gray-50">
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

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by User</label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:border-primary bg-white text-sm"
              value={selectedUser || ''}
              onChange={(e) => setSelectedUser(e.target.value || null)}
            >
              <option value="">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.full_name}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 mt-auto">
            <Button className="w-full" onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
          </div>
        </div>
      </Sheet>

      {/* Confirm Delete Dialog */}
      {confirmDeleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Delete Record</h2>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete <span className="font-semibold text-gray-800">{confirmDeleteItem.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setConfirmDeleteItem(null)}
                disabled={!!deletingId}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600 text-white border-0"
                onClick={() => handleDelete(confirmDeleteItem)}
                disabled={!!deletingId}
              >
                {deletingId === confirmDeleteItem.id ? <Loader2 className="animate-spin" size={16} /> : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Sheet */}
      <Sheet
        isOpen={isEditSheetOpen}
        onClose={() => setIsEditSheetOpen(false)}
        title={`Edit ${activeTab === 'Companies' ? 'Company' : activeTab.slice(0, -1)}`}
      >
        {editingItem && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:border-primary"
                value={editingItem.name || ''}
                onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
              />
            </div>

            {activeTab === 'Companies' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:border-primary bg-white"
                  value={editingItem.event_id || ''}
                  onChange={e => setEditingItem({ ...editingItem, event_id: e.target.value })}
                >
                  <option value="">Select an event...</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>{event.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:border-primary bg-white"
                  value={editingItem.type || ''}
                  onChange={e => setEditingItem({ ...editingItem, type: e.target.value })}
                >
                  <option value="hotel">Hotel</option>
                  <option value="food">Food</option>
                  <option value="goodies">Goodies</option>
                  <option value="passage">Passage</option>
                  <option value="salle">Salle</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:border-primary bg-white"
                value={editingItem.status || ''}
                onChange={e => setEditingItem({ ...editingItem, status: e.target.value })}
              >
                {activeTab === 'Companies' ? (
                  <>
                    <option value="contacted">Contacted</option>
                    <option value="pending">Pending</option>
                    <option value="signed">Signed</option>
                    <option value="rejected">Rejected</option>
                  </>
                ) : (
                  <>
                    <option value="available">Available</option>
                    <option value="pending">Pending</option>
                    <option value="booked">Booked</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Method</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:border-primary bg-white"
                value={editingItem.contact_method || ''}
                onChange={e => setEditingItem({ ...editingItem, contact_method: e.target.value })}
              >
                <option value="call">Call</option>
                <option value="email">Email</option>
                <option value="linkedin">LinkedIn</option>
                <option value="outing">Outing</option>
                <option value="social_media">Social Media</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:border-primary"
                value={editingItem.contact || ''}
                onChange={e => setEditingItem({ ...editingItem, contact: e.target.value })}
                placeholder="Phone, email, or name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Operator</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:border-primary bg-white"
                value={editingItem.assigned_user_id || ''}
                onChange={e => setEditingItem({ ...editingItem, assigned_user_id: e.target.value })}
              >
                <option value="">Unassigned</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.full_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:border-primary min-h-[100px]"
                value={editingItem.notes || ''}
                onChange={e => setEditingItem({ ...editingItem, notes: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isUpdating}>
              {isUpdating ? <Loader2 className="animate-spin" size={18} /> : 'Update Record'}
            </Button>
          </form>
        )}
      </Sheet>
    </div>
  );
};
