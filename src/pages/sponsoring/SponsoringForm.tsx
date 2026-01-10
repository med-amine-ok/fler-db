import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const SponsoringForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    status: 'contacted',
    contact_method: 'email',
    notes: '',
    contact: ''
  });

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Add timeout warning
    const timeoutId = setTimeout(() => {
      console.warn('Request is taking longer than expected. This might be a permissions issue.');
      alert('Request timeout - check browser console (F12) for details. This might be an RLS (Row Level Security) policy issue.');
      setLoading(false);
    }, 10000);
    
    try {
        const payload = {
            name: formData.name,
            status: formData.status,
            contact_method: formData.contact_method,
            assigned_user_id: currentUserId,
            notes: formData.notes,
            contact: formData.contact
        };

        console.log('Inserting company:', payload);
        const { data, error } = await supabase
            .from('companies')
            .insert(payload as any)
            .select();
        
        console.log('Insert response:', { data, error });
        
        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }
        
        clearTimeout(timeoutId);
        navigate('/teams/sponsoring');
    } catch (error: any) {
        clearTimeout(timeoutId);
        console.error('Error adding company:', error);
        alert('Failed to add company: ' + (error.message || error));
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/teams/sponsoring')}
        className="flex items-center gap-2 text-gray-500 hover:text-text transition-colors"
      >
        <ArrowLeft size={18} /> Back to Database
      </button>

      <div className="glass-card p-8">
        <h1 className="text-2xl font-bold mb-6">Add New Company</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none bg-white"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="contacted">Contacted</option>
                  <option value="pending">Pending</option>
                  <option value="signed">Signed</option>
                  <option value="rejected">Rejected</option>
                </select>
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Details (Phone/Email)</label>
            <input 
              type="text" 
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none"
              placeholder="e.g. John Doe - 0612345678"
              value={formData.contact}
              onChange={e => setFormData({...formData, contact: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea 
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none min-h-[100px]"
              placeholder="Any additional details..."
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save Company</>}
          </button>
        </form>
      </div>
    </div>
  );
};
