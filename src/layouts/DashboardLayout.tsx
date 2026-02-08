import { Sidebar } from '../components/Sidebar';
import { Outlet, useLocation } from 'react-router-dom';
import { Bell, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Modal } from '../components/ui/Modal';

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

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');


  const messages = [
    "Your hard work is paving the way for a brighter future. Keep it up! 🚀",
    "Every small step counts. You're doing great! ✨",
    "Thank you for your dedication to the team! We appreciate you. 💙",
    "Success is the sum of small efforts, repeated day in and day out. 💪",
    "The only way to do great work is to love what you do. ❤️",
    "Believe you can and you're halfway there. 🌟",
    "You are making a difference today! Keep shining. ☀️",
    "Don't watch the clock; do what it does. Keep going. ⏰",
    "Your positive attitude is contagious. Thank you! 😊",
    "Great things never came from comfort zones. Push forward! 🔥",
    "Building strong partnerships is the bridge to our community's success! 🤝",
    "Our external relations team is the face of our mission. Shine on! 🌍",
    "Sponsorships turn our dreams into reality. Great job securing that support! 💼",
    "Strategic alliances are the foundation of our sustainable growth. 🏗️",
    "Every new sponsor brings us closer to our goal. Keep pitching! 🎯",
    "Nurturing relationships is at the heart of everything we do. ❤️",
    "Innovation distinguishes between a leader and a follower. Keep leading! 💡",
    "Teamwork makes the dream work! 🤝",
    "Your contribution is invaluable to our growth. 📈",
    "Keep your head high and your goals higher. 🏔️",
    "Collaboration is the key to unlocking new opportunities. 🔑",
    "Your energy and passion are what drive us forward. ⚡",
    "Success is better when shared. Thank you for being a team player! 🏆",
    "Persistence guarantees that results are inevitable. 🏁",
    "Focus on being productive instead of busy. 🐝",
    "The best way to predict the future is to create it. 🎨"
  ];


  const handleBellClick = () => {
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setNotificationMessage(randomMessage);
    setIsNotificationOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="flex-1 md:ml-72 flex flex-col min-h-screen relative">
        {/* Background Watermark */}
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center md:ml-72">
          <img src="/vic.png" className="block md:hidden w-[500px] opacity-[0.2]" alt="" />
          <img src="/vic_long.png" className="hidden md:block w-[1000px] opacity-[0.2]" alt="" />
        </div>

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

            <button 
              onClick={handleBellClick}
              className="relative p-2.5 bg-white rounded-full shadow-sm hover:shadow-md text-gray-500 hover:text-primary transition-all"
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

      <Modal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        title="Thinking of you 🌟"
        size="sm"
      >
        <div className="text-center p-4">
          <p className="text-lg font-medium text-gray-700 leading-relaxed italic">
            "{notificationMessage}"
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setIsNotificationOpen(false)}
              className="px-6 py-2 bg-primary text-white rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              Thanks! 💙
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
