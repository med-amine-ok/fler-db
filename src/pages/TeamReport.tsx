import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Building2 } from 'lucide-react';
import { mockCompanies } from '../lib/mockData';

export const TeamReport = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyId: '',
    progress: 0,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // API Call simulation
    navigate('/teams');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/teams')}
        className="flex items-center gap-2 text-gray-500 hover:text-text transition-colors"
      >
        <ArrowLeft size={18} /> Back to Teams
      </button>

      <div className="glass-card p-8">
        <h1 className="text-2xl font-bold mb-6">Contact Report</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
             <div className="relative">
                <Building2 className="absolute left-3 top-3 text-gray-400" size={18} />
                <select 
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none bg-white"
                  value={formData.companyId}
                  onChange={(e) => setFormData({...formData, companyId: e.target.value})}
                  required
                >
                  <option value="">Select a company</option>
                  {mockCompanies.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.status})</option>
                  ))}
                </select>
             </div>
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Contact Progress</label>
             <div className="flex items-center gap-4">
               <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="10"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  value={formData.progress}
                  onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value)})}
               />
               <span className="font-bold text-primary w-12 text-right">{formData.progress}%</span>
             </div>
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Status Update</label>
              <textarea 
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Call summary, next steps, etc."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                required
              />
           </div>

           <div className="pt-4 border-t border-gray-100">
             <button 
                type="submit"
                className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
             >
               <Save size={18} /> Submit Report
             </button>
           </div>
        </form>
      </div>
    </div>
  );
};
