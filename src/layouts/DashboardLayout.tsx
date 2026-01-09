import { Sidebar } from '../components/Sidebar';
import { Outlet, useLocation } from 'react-router-dom';
import { Bell, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const DashboardLayout = () => {
  const location = useLocation();
  const pageTitle = location.pathname.split('/')[1] || 'Overview';
  const isHome = pageTitle.toLowerCase() === 'home' || pageTitle.toLowerCase() === 'overview';
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      
      if ((profile as any)?.full_name) {
        setUserName((profile as any).full_name);
      } else {
        setUserName(user.email?.split('@')[0] || 'User');
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // App.tsx will handle the redirect via onAuthStateChange
  };

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar />
      <main className="flex-1 ml-72">
        {/* Top Header */}
        <header className="sticky relative top-0 z-40 bg-background/80 backdrop-blur-md px-8 py-5 flex items-center justify-between border-b border-gray-200/50">
           <h2 className="text-xl font-bold text-text capitalize tracking-tight">
             {isHome ? (
               <span className="bg-gradient-to-r from-text to-gray-500 bg-clip-text text-transparent">
                 Welcome back, {userName.split(' ')[0]} 
               </span>
             ) : (
               <>
                 {pageTitle.replace('-', ' ')}
                 {location.pathname.includes('database') && ' Database'}
               </>
             )}
           </h2>

           <div className="flex items-center gap-4">
              
              <button className="relative p-2.5 bg-white rounded-full shadow-sm hover:shadow-md text-gray-500 hover:text-primary transition-all">
                 <Bell size={20} />
                 <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full shadow-sm hover:shadow-md text-gray-500 hover:text-red-500 transition-all"
                title="Logout"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium">Logout</span>
              </button>
           </div>
        </header>

        <div className="p-8 animate-fade-in pb-20">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
