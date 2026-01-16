import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Database, User } from 'lucide-react';
import { clsx } from 'clsx';

export const BottomNav = () => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Home', path: '/home' },
    { icon: Calendar, label: 'Events', path: '/events' },
    { icon: Database, label: 'Database', path: '/database' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 md:hidden z-50 pb-safe">
      <nav className="flex items-center justify-between">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative",
                isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={clsx("p-1 rounded-full transition-all", isActive && "bg-primary/10")}>
                    <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full shadow-lg shadow-primary/50"></span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
