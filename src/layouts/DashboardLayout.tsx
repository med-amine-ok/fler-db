import { Sidebar } from "../components/Sidebar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, LogOut, Quote, Sparkles, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { supabase } from "../lib/supabase";
import { Modal } from "../components/ui/Modal";
import { CommandPalette } from "../components/CommandPalette";
import { BottomNav } from "../components/BottomNav";

export const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = location.pathname.split("/")[1] || "Overview";
  const isHome =
    pageTitle.toLowerCase() === "home" ||
    pageTitle.toLowerCase() === "overview";

  const [userName, setUserName] = useState("User");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

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
    "The best way to predict your future is to create it today",
    "You are allowed to outgrow the version of you that people knew",
    "What feels like an ending may simply be a redirection",
    "Be patient with yourself. You’re becoming someone you’ve never been before",
    "You don’t need to have it all figured out to keep moving forward",
    "Some chapters are meant to teach you, not stay with you",
    "Your future self is counting on the choices you make today",
    "You can start again as many times as you need",
    "Growth is uncomfortable because becoming better requires becoming different",
    "Not everything you lose is a loss",
    "True growth often begins when the discomfort ends",
    "Protect your peace. Not everything deserves your reaction",
    "The life you want is built through the things you do consistently, not occasionally",
    "You don’t have to see the whole staircase. Just take the next step",
    "Sometimes the bravest thing you can do is keep going quietly",
    "Your pace is still progress",
    "Don’t compare your behind-the-scenes to someone else’s highlight reel",
    "A bad day does not mean a bad life",
    "You become unstoppable when you stop waiting for permission",
    "Discipline will take you places motivation cannot",
    "You are not starting from zero. You are starting from experience",
    "The right path won’t always be the easiest one",
    "Pray about it until you no longer have to worry about it",
    "Don’t wish for it. Work for it",
    "Success is never final, failure is never fatal. It’s the courage to continue that counts",
    "One day, you will look back and understand why Allah made you wait",
    "Indeed, with hardship comes ease. Qur’an 94:6",
    "One day, the things you’re struggling through will become the things you’re proud you survived.",
    "Sometimes peace looks like letting go without getting an explanation.",
    "Never let one bad season convince you that your whole life is winter",
    "Your only competition is the person you were yesterday",
    "Learn to walk away from anything that costs you your peace",
    "Stop waiting for the perfect moment. Create one",
    "Make your future self proud of the choices you make today",
    "Allah does not burden a soul beyond what it can bear. Qur’an 2:286",
    "And whoever relies upon Allah, He is sufficient for him. Qur’an 65:3",
    "What is meant for you will never miss you",
    "Trust Allah’s timing. What feels like a delay may be divine preparation",
    "Do not lose hope in the mercy of Allah. Qur’an 39:53",
  ];

  useEffect(() => {
    fetchUserProfile();

    // Trigger random deep wisdom popup ONLY on the first entry of the session
    const hasSeenWisdom = sessionStorage.getItem("fler_wisdom_shown");
    if (!hasSeenWisdom) {
      const randomMessage =
        messages[Math.floor(Math.random() * messages.length)];
      setNotificationMessage(randomMessage);
      setIsNotificationOpen(true);
      sessionStorage.setItem("fler_wisdom_shown", "true");
    }

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }

      // Alt + number shortcuts
      if (e.altKey && ["1", "2", "3", "4", "5"].includes(e.key)) {
        e.preventDefault();
        const routes = ["/home", "/database", "/events", "/teams", "/profile"];
        const index = parseInt(e.key) - 1;
        if (routes[index]) {
          navigate(routes[index]);
        }
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [navigate]);

  const fetchUserProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if ((profile as any)?.full_name) {
        setUserName((profile as any).full_name);
      } else {
        setUserName(user.email?.split("@")[0] || "User");
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
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />
      <main
        className={clsx(
          "flex-1 flex flex-col min-h-screen relative transition-all duration-300",
          sidebarCollapsed ? "md:ml-16" : "md:ml-72",
        )}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md px-4 md:px-8 py-4 md:py-5 flex items-center justify-between border-b border-gray-200/50">
          <div className="flex items-center gap-4">
            {/* Animated Hamburger / X toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] p-1 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors relative"
              aria-label="Toggle menu"
            >
              <span
                className={clsx(
                  "block h-0.5 bg-gray-700 rounded-full transition-all duration-300 origin-center",
                  sidebarOpen ? "w-5 rotate-45 translate-y-[7px]" : "w-6",
                )}
              />
              <span
                className={clsx(
                  "block h-0.5 bg-gray-700 rounded-full transition-all duration-300",
                  sidebarOpen ? "w-0 opacity-0" : "w-5 opacity-100",
                )}
              />
              <span
                className={clsx(
                  "block h-0.5 bg-gray-700 rounded-full transition-all duration-300 origin-center",
                  sidebarOpen ? "w-5 -rotate-45 -translate-y-[7px]" : "w-6",
                )}
              />
            </button>
            <h2 className="text-lg md:text-xl font-bold text-text capitalize tracking-tight line-clamp-2">
              {isHome ? (
                <span className="bg-gradient-to-r from-text to-gray-500 bg-clip-text text-transparent">
                  Welcome back, {userName.split(" ")[0]}
                </span>
              ) : (
                <>
                  {pageTitle.replace("-", " ")}
                  {location.pathname.includes("database") && " Database"}
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
