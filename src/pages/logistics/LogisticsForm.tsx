import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const LogisticsForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    type: 'hotel',
    status: 'available',
    contact_method: 'email',
    assigned_user_id: '',
    notes: '',
    contact: ''
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if (data) setProfiles(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        const payload = {
            name: formData.name,
            type: formData.type,
            status: formData.status,
            contact_method: formData.contact_method,
            assigned_user_id: formData.assigned_user_id || null,
            notes: formData.notes,
            contact: formData.contact
        };

        const { error } = await supabase
            .from('logistics')
            .insert(payload as any);

        if (error) throw error;
        navigate('/teams/logistics');
    } catch (error: any) {
        console.error('Error adding resource:', error);
        alert('Failed to add resource: ' + error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/teams/logistics')}
        className="flex items-center gap-2 text-gray-500 hover:text-text transition-colors"
      >
        <ArrowLeft size={18} /> Back to Database
      </button>

      <div className="glass-card p-8">
        <h1 className="text-2xl font-bold mb-6">Add New Resource</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resource Name</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select 
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none bg-white"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="hotel">Hotel</option>
                <option value="goodies">Goodies</option>
                <option value="food">Food</option>
                <option value="salle">Salle</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none bg-white"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Contact Method</label>
             <select 
               className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none bg-white"
               value={formData.contact_method}
               onChange={e => setFormData({...formData, contact_method: e.target.value})}
             >
               <option value="email">Email</option>
               <option value="linkedin">LinkedIn</option>
               <option value="call">Call</option>
               <option value="outing">Outing</option>
             </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Details</label>
            <input 
              type="text" 
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none"
              placeholder="e.g. Manager Name - 0612345678"
              value={formData.contact}
              onChange={e => setFormData({...formData, contact: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
            <select 
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none bg-white"
              value={formData.assigned_user_id}
              onChange={e => setFormData({...formData, assigned_user_id: e.target.value})}
            >
              <option value="">Unassigned</option>
              {profiles.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name || p.email}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea 
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none min-h-[100px]"
              placeholder="Internal notes..."
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save Resource</>}
          </button>
        </form>
      </div>
    </div>
  );
};
