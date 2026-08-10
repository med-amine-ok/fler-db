import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, AlertCircle } from 'lucide-react';

export const Auth = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const parseAuthError = () => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));

    const err = params.get('error') || hashParams.get('error');
    const errDesc = params.get('error_description') || hashParams.get('error_description');
    const rejectedEmail = params.get('email');

    if (err === 'unauthorized') {
      return rejectedEmail
        ? `The email "${rejectedEmail}" is not authorized to access Fler. Please sign in with an authorized student organization email.`
        : 'This email is not authorized to access the system.';
    }
    if (err === 'db_error') return 'Database connection issue. Please try again later.';
    if (errDesc) return decodeURIComponent(errDesc.replace(/\+/g, ' '));
    if (err) return `Authentication error: ${err}`;
    return null;
  };

  const [error, setError] = useState<string | null>(parseAuthError);

  useEffect(() => {
    const authErr = parseAuthError();
    if (authErr) {
      setError(authErr);
    }
  }, [searchParams]);

  const anonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const isPlaceholderUrl =
    import.meta.env.VITE_SUPABASE_URL?.includes('fler-db-app.supabase.co') ||
    anonKey?.includes('demoKey');

  const handleGoogleLogin = async () => {
    if (isPlaceholderUrl) {
      setError(
        'Invalid Supabase Configuration: Your .env file is using a placeholder domain (fler-db-app.supabase.co). Please update .env with your real Supabase Project URL and Anon Key from app.supabase.com.'
      );
      return;
    }

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

          {isPlaceholderUrl && (
            <div className="mb-6 p-4 bg-amber-50 text-amber-800 text-xs md:text-sm rounded-xl border border-amber-200 text-left">
              <p className="font-bold mb-1 flex items-center gap-1.5 text-amber-900">
                ⚠️ Placeholder Supabase URL Detected
              </p>
              <p className="leading-relaxed">
                Your <code>.env</code> file currently uses a dummy placeholder domain (<code>fler-db-app.supabase.co</code>). To make Google OAuth work, please update <code>.env</code> with your real Supabase Project URL & Anon Key from <a href="https://app.supabase.com" target="_blank" rel="noreferrer" className="underline font-semibold text-amber-900">app.supabase.com</a>.
              </p>
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
