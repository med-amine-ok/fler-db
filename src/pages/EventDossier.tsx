import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Save, Check } from 'lucide-react';

export const EventDossier = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    description: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create text content for the file
    const fileContent = `
SPONSORING DOSSIER
Event ID: ${id}
Date: ${formData.date}
-------------------------
DESCRIPTION:
${formData.description}

----------------
NOTES:
${formData.notes}
    `.trim();

    // Create blob and download link
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dossier_event_${id}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Simulate API call and proceed
    setTimeout(() => setSubmitted(true), 500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-text transition-colors"
      >
        <ArrowLeft size={18} /> Back to Events
      </button>

      <div className="glass-card p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text">Sponsoring Dossier</h1>
          <p className="text-gray-500">Submit the sponsorship details for Event #{id}</p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
                required 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description / Content</label>
              <textarea 
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Details about the sponsorship package..."
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Private Notes</label>
              <textarea 
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Internal notes..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Save size={18} /> Save & Download
            </button>
          </form>
        ) : (
          <div className="text-center py-10 animate-fade-in">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Dossier Created!</h3>
            <p className="text-gray-500 mb-8">You can now upload the official document.</p>
          
            <button 
               onClick={() => navigate('/events')}
               className="mt-8 text-primary font-medium hover:underline"
            >
              Back to Events List
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
