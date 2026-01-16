import { Sidebar } from '../components/Sidebar';
import { Outlet, useLocation } from 'react-router-dom';
import { Bell, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

import { BottomNav } from '../components/BottomNav';

export const DashboardLayout = () => {
  const location = useLocation();
  const pageTitle = location.pathname.split('/')[1] || 'Overview';
  const isHome = pageTitle.toLowerCase() === 'home' || pageTitle.toLowerCase() === 'overview';
  const [userName, setUserName] = useState('User');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="flex-1 md:ml-72 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md px-4 md:px-8 py-4 md:py-5 flex items-center justify-between border-b border-gray-200/50">
           <div className="flex items-center gap-4">
             {/* Mobile Menu Toggle - Opens Drawer */}
             <button 
               onClick={() => setSidebarOpen(!sidebarOpen)}
               className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
             >
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
               </svg>
             </button>
             <h2 className="text-lg md:text-xl font-bold text-text capitalize tracking-tight line-clamp-2">
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
           </div>

           <div className="flex items-center gap-2 md:gap-4">
              
              <button className="relative p-2.5 bg-white rounded-full shadow-sm hover:shadow-md text-gray-500 hover:text-primary transition-all">
                 <Bell size={20} />
                 <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              <button 
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-white rounded-full shadow-sm hover:shadow-md text-gray-500 hover:text-red-500 transition-all text-sm md:text-base"
                title="Logout"
              >
                <LogOut size={18} />
                <span className="font-medium hidden sm:inline">Logout</span>
              </button>
           </div>
        </header>

        <div className="flex-1 p-4 md:p-8 animate-fade-in pb-24 md:pb-8">
          <Outlet />
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
};
