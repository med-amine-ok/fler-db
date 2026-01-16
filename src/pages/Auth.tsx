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
          redirectTo: `${window.location.origin}`,
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-6 md:py-8">
      <div className="max-w-md w-full border-0 shadow-2xl rounded-2xl md:rounded-3xl p-6 md:p-10 text-center animate-fade-in relative overflow-hidden bg-white">
        {/* Decorative Background Elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/5 rounded-full blur-3xl"></div>

        <div className="relative">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-3 tracking-tight text-text">Welcome Back</h2>
          <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">Sign in to access your dashboard</p>

          {error && (
            <div className="mb-6 md:mb-8 p-4 bg-red-50 text-red-600 text-xs md:text-sm rounded-xl border border-red-100 flex items-start gap-3 animate-shake">
              <AlertCircle size={18} className="shrink-0 flex-shrink-0 mt-0.5" />
              <p className="font-medium text-left">{error}</p>
            </div>
          )}

          <div className="space-y-4 md:space-y-6">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 md:py-4 px-6 bg-white border border-gray-200 rounded-lg md:rounded-2xl flex items-center justify-center gap-3 md:gap-4 hover:bg-gray-50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all group scale-100 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin text-primary" size={20} />
              ) : (
                <>
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 md:w-6 md:h-6" alt="Google" />
                  <span className="font-semibold text-gray-700 group-hover:text-black text-sm md:text-base">Continue with Google</span>
                </>
              )}
            </button>
            
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              Only authorized student organization emails can access Fler.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
