import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

export const DatabaseForm = () => {
  const navigate = useNavigate();
  const [useParams] = useSearchParams();
  const type = useParams.get('type') || 'Companies';

  const [formData, setFormData] = useState({
    name: '',
    status: '',
    date: '',
    description: '',
    assignedTo: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`${type} Added Successfully`);
    navigate('/database');
  };

  const renderFields = () => {
    switch(type) {
      case 'Events':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
              <input type="text" required className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-primary" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" required className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-primary" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-primary bg-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="ongoing">ongoing</option>
                <option value="ongoing">Ongoing</option>
                <option value="ongoing">ongoing</option>
              </select>
            </div>
          </>
        );
      case 'Companies':
      default:
        return (
           <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input type="text" required className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-primary" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
               <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-primary bg-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="contacted">Contacted</option>
                <option value="negotiating">Negotiating</option>
                <option value="signed">Signed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-primary" value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})} />
            </div>
          </>
        )
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/database')}
        className="flex items-center gap-2 text-gray-500 hover:text-text transition-colors"
      >
        <ArrowLeft size={18} /> Back to Database
      </button>

      <div className="glass-card p-8">
        <h1 className="text-2xl font-bold mb-6">Add New {type ? type.slice(0, -1) : 'Item'}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderFields()}
          <button type="submit" className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
            <Save size={18} /> Save Record
          </button>
        </form>
      </div>
    </div>
  );
};
