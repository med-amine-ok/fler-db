import { Sidebar } from '../components/Sidebar';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Quote, Sparkles, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { supabase } from '../lib/supabase';
import { Modal } from '../components/ui/Modal';
import { CommandPalette } from '../components/CommandPalette';
import { BottomNav } from '../components/BottomNav';

export const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = location.pathname.split('/')[1] || 'Overview';
  const isHome = pageTitle.toLowerCase() === 'home' || pageTitle.toLowerCase() === 'overview';
  
  const [userName, setUserName] = useState('User');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const messages = [
    "The cave you fear to enter holds the treasure you seek",
    "We are what we repeatedly do. Excellence, then, is not an act, but a habit",
    "The master has failed more times than the beginner has even tried",
    "He who has a why to live can bear almost any how",
    "Do not judge each day by the harvest you reap, but by the seeds that you plant",
    "In the depth of winter, I finally learned that within me there lay an invincible summer",
    "It is during our darkest moments that we must focus to see the light",
    "Knowing yourself is the beginning of all wisdom",
    "What we achieve inwardly will change outer reality",
    "Small daily improvements over time lead to stunning results",
    "Discipline is choosing between what you want now and what you want most",
    "Turn your wounds into wisdom",
    "The secret of change is to focus all energy not on fighting the old, but on building the new",
    "Rivers know this: there is no hurry. We shall get there someday",
    "The obstacle in the path becomes the path. Within every difficulty lies opportunity",
    "Clear mind, steadfast heart, relentless spirit",
    "Your focus determines your reality. Direct it with intention",
    "True mastery is not about overcoming others; it is about transcending your past self",
    "Wisdom is knowing the right path to take; integrity is taking it",
    "Believe in the power of compound effort. Consistency is the magic formula",
    "Building strong partnerships is the bridge to our community's lasting success",
    "Innovation distinguishes between a leader and a follower. Keep leading!",
    "Teamwork transforms individual strength into collective triumph",
    "Focus on being productive instead of busy. Quality outweighs quantity",
    "The best way to predict your future is to create it today"
  ];

  useEffect(() => {
    fetchUserProfile();

    // Trigger random deep wisdom popup on initial entry
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setNotificationMessage(randomMessage);
    setIsNotificationOpen(true);
    
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      
      // Alt + number shortcuts
      if (e.altKey && ['1', '2', '3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        const routes = ['/home', '/database', '/events', '/teams', '/profile'];
        const index = parseInt(e.key) - 1;
        if (routes[index]) {
          navigate(routes[index]);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [navigate]);

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
  };

  const handleBellClick = () => {
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setNotificationMessage(randomMessage);
    setIsNotificationOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
      <main className={clsx(
        "flex-1 flex flex-col min-h-screen relative transition-all duration-300",
        sidebarCollapsed ? "md:ml-16" : "md:ml-72"
      )}>
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md px-4 md:px-8 py-4 md:py-5 flex items-center justify-between border-b border-gray-200/50">
          <div className="flex items-center gap-4">
            {/* Animated Hamburger / X toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] p-1 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors relative"
              aria-label="Toggle menu"
            >
              <span className={clsx(
                "block h-0.5 bg-gray-700 rounded-full transition-all duration-300 origin-center",
                sidebarOpen ? "w-5 rotate-45 translate-y-[7px]" : "w-6"
              )} />
              <span className={clsx(
                "block h-0.5 bg-gray-700 rounded-full transition-all duration-300",
                sidebarOpen ? "w-0 opacity-0" : "w-5 opacity-100"
              )} />
              <span className={clsx(
                "block h-0.5 bg-gray-700 rounded-full transition-all duration-300 origin-center",
                sidebarOpen ? "w-5 -rotate-45 -translate-y-[7px]" : "w-6"
              )} />
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
            {/* Command Palette trigger */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 md:py-2 bg-white hover:bg-gray-50 border border-gray-200/60 rounded-full shadow-sm text-gray-400 hover:text-gray-600 transition-all text-xs md:text-sm font-medium"
              title="Search (Ctrl+K)"
            >
              <Search size={16} />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-[10px] font-mono text-gray-500">
                <span>⌘</span>K
              </kbd>
            </button>

            <button
              onClick={handleBellClick}
              className="relative p-2.5 bg-white rounded-full shadow-sm hover:shadow-md text-gray-500 hover:text-primary transition-all"
              aria-label="View daily wisdom"
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
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

      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      <Modal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        title="Daily Wisdom"
        size="md"
      >
        <div className="flex flex-col items-center justify-center py-8 px-6">
          {/* Decorative Icon */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-60"></div>
            <div className="bg-primary/10 p-4 rounded-full relative z-10">
              <Sparkles className="w-10 h-10 text-primary animate-pulse" />
            </div>
          </div>

          {/* Message with Decorative Quotes */}
          <div className="relative max-w-sm text-center mb-10">
            <Quote className="absolute -top-6 -left-2 w-8 h-8 text-primary/10 transform -scale-x-100" />

            <p className="text-xl md:text-2xl font-serif font-medium text-gray-800 leading-relaxed tracking-wide italic">
              {notificationMessage}
            </p>

            <Quote className="absolute -bottom-6 -right-2 w-8 h-8 text-primary/10" />
          </div> 
        </div>
      </Modal>
    </div>
  );
};
