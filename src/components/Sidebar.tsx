import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Database, User, ChevronRight, X } from 'lucide-react';
import { clsx } from 'clsx';

export const Sidebar = ({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void }) => {
  


  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/home' },
    { icon: Database, label: 'Database', path: '/database' },
    { icon: Calendar, label: 'Events', path: '/events' },
    { icon: Users, label: 'Teams', path: '/teams' },
    { icon: User, label: 'My Profile', path: '/profile' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside className={clsx(
        "h-screen w-full md:w-72 bg-sidebar text-white flex flex-col fixed left-0 top-0 shadow-2xl z-50 transition-transform duration-300 md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 md:p-8 pb-4 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tighter bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
            FLER DataBase
          </h1>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Menu</p>
          
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                clsx(
                  "flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/25 font-semibold"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3.5 z-10">
                    <item.icon size={22} className={clsx("transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                    <span className="text-sm md:text-base">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={16} className="text-white/50" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

      
      </aside>
    </>
  );
};
