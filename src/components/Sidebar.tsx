import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Database, User, LogOut, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/auth');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/home' },
    { icon: User, label: 'My Profile', path: '/profile' },
    { icon: Calendar, label: 'Events', path: '/events' },
    { icon: Users, label: 'Teams', path: '/teams' },
    { icon: Database, label: 'Database', path: '/database' },
  ];

  return (
    <aside className="h-screen w-72 bg-sidebar text-white flex flex-col fixed left-0 top-0 shadow-2xl z-50">
      <div className="p-8 pb-4">
        <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
          FLER DataBase
        </h1>

      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Menu</p>
        
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
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
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={16} className="text-white/50" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 m-4 bg-white/5 rounded-2xl">
         
         <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-4 py-2 w-full rounded-lg text-xs font-medium bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
