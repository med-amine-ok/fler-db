import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
         localStorage.setItem('isAuthenticated', 'true');
         navigate('/home');
      }
    } catch (err: any) {
       // If login fails, try signup
       const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
       });

       if (signUpError) {
         setError(err.message); // Show login error if signup also fails or if user exists
       } else if (data.user) {
          localStorage.setItem('isAuthenticated', 'true');
          navigate('/home');
       }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full glass-card p-8 text-center animate-fade-in relative">
        <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
        <p className="text-gray-500 mb-8">Sign in to access your dashboard</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
           <Input 
             label="Email" 
             type="email" 
             value={email} 
             onChange={(e) => setEmail(e.target.value)} 
             placeholder="Enter your email" 
             required
           />
           <Input 
             label="Password" 
             type="password" 
             value={password} 
             onChange={(e) => setPassword(e.target.value)} 
             placeholder="Enter your password" 
             required
             minLength={6}
           />
           
           <Button fullWidth disabled={loading} type="submit" className="mt-2">
             {loading ? <Loader2 className="animate-spin" /> : 'Continue with Email'}
           </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-400">or</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 px-4 border border-gray-300 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors group bg-white"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
          <span className="font-medium text-gray-700 group-hover:text-black">Sign in with Google</span>
        </button>
      </div>
    </div>
  );
};
