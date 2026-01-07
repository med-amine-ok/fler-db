import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { mockEvents } from '../../lib/mockData';

export const SponsoringForm = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const event = mockEvents.find(e => e.id === eventId);
  
  const [formData, setFormData] = useState({
    name: '',
    status: 'contacted',
    assignedTo: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API Add
    alert('Company Added Successfully');
    navigate(`/teams/sponsoring/${eventId}`);
  };

  if (!event) return <div>Event not found</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button 
        onClick={() => navigate(`/teams/sponsoring/${eventId}`)}
        className="flex items-center gap-2 text-gray-500 hover:text-text transition-colors"
      >
        <ArrowLeft size={18} /> Back to Database
      </button>

      <div className="glass-card p-8">
        <h1 className="text-2xl font-bold mb-6">Add Company for {event.name}</h1>
        
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none bg-white"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
            >
              <option value="contacted">Contacted</option>
              <option value="negotiating">Negotiating</option>
              <option value="signed">Signed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To (User ID)</label>
            <input 
              type="text" 
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none"
              placeholder="Optional"
              value={formData.assignedTo}
              onChange={e => setFormData({...formData, assignedTo: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Save size={18} /> Save Company
          </button>
        </form>
      </div>
    </div>
  );
};
