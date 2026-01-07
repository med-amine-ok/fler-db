import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { mockEvents } from '../../lib/mockData';

export const LogisticsForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: 'hotel',
    eventId: '',
    status: 'available'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API Add
    alert('Resource Added Successfully');
    navigate('/teams/logistics');
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
                <option value="goodie">Goodie</option>
                <option value="food">Food</option>
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
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Related Event</label>
            <select 
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none bg-white"
              value={formData.eventId}
              onChange={e => setFormData({...formData, eventId: e.target.value})}
              required
            >
              <option value="">Select Event</option>
              {mockEvents.map(evt => (
                <option key={evt.id} value={evt.id}>{evt.name}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Save size={18} /> Save Resource
          </button>
        </form>
      </div>
    </div>
  );
};
