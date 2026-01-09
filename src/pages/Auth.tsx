import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, AlertCircle } from 'lucide-react';

export const Auth = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(() => {
    const err = searchParams.get('error');
    if (err === 'unauthorized') return 'This email is not authorized to access the system.';
    if (err === 'db_error') return 'Database connection issue. Please try again later.';
    return null;
  });

  useEffect(() => {
    const err = searchParams.get('error');
    if (err === 'unauthorized') {
      setError('This email is not authorized to access the system.');
    } else if (err === 'db_error') {
      setError('Database connection issue. Please try again later.');
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/home`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full glass-card p-10 text-center animate-fade-in relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/5 rounded-full blur-3xl"></div>

        <div className="relative">
          <h2 className="text-3xl font-bold mb-2 tracking-tight text-text">Welcome Back</h2>
          <p className="text-gray-500 mb-10 text-lg">Sign in to access your dashboard</p>

          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-3 animate-shake">
              <AlertCircle size={20} className="shrink-0" />
              <p className="font-medium text-left leading-relaxed">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-4 px-6 bg-white border border-gray-200 rounded-2xl flex items-center justify-center gap-4 hover:bg-gray-50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all group scale-100 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin text-primary" size={24} />
              ) : (
                <>
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
                  <span className="font-bold text-gray-700 group-hover:text-black">Continue with Google</span>
                </>
              )}
            </button>
            
            <p className="text-xs text-gray-400 font-medium">
              Only authorized student organization emails can access Fler.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
