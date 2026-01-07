import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const Landing = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      navigate('/auth', { state: { email } });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="max-w-md w-full glass-card p-10 text-center animate-fade-in-up">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
          Welcome to Fler
        </h1>
        <p className="text-gray-500 mb-8 text-lg">
          Manage your events, teams, and progress seamlessly.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-gray-50/50"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-3 px-6 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
          >
            Continue <ArrowRight size={18} />
          </button>
        </form>
      </div>
      
      <p className="mt-8 text-gray-400 text-sm">
        Student Organization Management System
      </p>
    </div>
  );
};
