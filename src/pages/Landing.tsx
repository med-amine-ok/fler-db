import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { ALLOWED_EMAILS } from '../lib/constants';

export const Landing = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedEmail = email.toLowerCase().trim();
    
    if (ALLOWED_EMAILS.includes(normalizedEmail)) {
      navigate('/auth', { state: { email: normalizedEmail } });
    } else {
      setError('Sorry, this email is not authorized to access the system.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-6 md:py-8">
      <div className="max-w-md w-full border-0 shadow-2xl rounded-2xl md:rounded-3xl p-6 md:p-10 text-center animate-fade-in-up bg-white">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4 md:mb-6">
          Welcome to Fler
        </h1>
        <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base leading-relaxed">
          Manage your events, teams, and progress seamlessly.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs md:text-sm rounded-xl border border-red-100 flex items-start gap-3 animate-shake">
            <AlertCircle size={18} className="shrink-0 flex-shrink-0 mt-0.5" />
            <p className="font-medium text-left">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          <div className="text-left">
            <label htmlFor="email" className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              className="w-full px-4 py-3 md:py-3.5 rounded-lg md:rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-gray-50/50 text-sm md:text-base"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-3 md:py-3.5 px-6 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg md:rounded-xl font-semibold hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/30 text-sm md:text-base"
          >
            Continue <ArrowRight size={18} className="md:w-5 md:h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
