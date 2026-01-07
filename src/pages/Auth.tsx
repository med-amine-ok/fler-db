import { useLocation, useNavigate } from 'react-router-dom';

export const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'User';

  const handleGoogleLogin = () => {
    // Mock login logic
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full glass-card p-8 text-center animate-fade-in">
        <h2 className="text-2xl font-bold mb-2">Hello, {email.split('@')[0]}</h2>
        <p className="text-gray-500 mb-8">Choose how you want to sign in</p>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 border border-gray-300 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors group"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            <span className="font-medium text-gray-700 group-hover:text-black">Sign in with Google</span>
          </button>
          
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
            className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
             Sign up with Google
          </button>
        </div>
      </div>
    </div>
  );
};
