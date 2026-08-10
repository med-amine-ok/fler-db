import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Database, Users, User, CornerDownLeft, Sparkles, Building2, Box } from 'lucide-react';
import { clsx } from 'clsx';
import { advancedMatch } from '../utils/search';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  description: string;
  category: 'Pages' | 'Events' | 'Actions';
  icon: React.ElementType;
  action: () => void;
}

export const CommandPalette = ({ isOpen, onClose }: CommandPaletteProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const items: CommandItem[] = [
    // Pages
    { id: 'home', title: 'Go to Overview', description: 'View the executive dashboard', category: 'Pages', icon: LayoutDashboardIcon, action: () => { navigate('/home'); onClose(); } },
    { id: 'database', title: 'Go to Database', description: 'Manage raw data and profiles', category: 'Pages', icon: Database, action: () => { navigate('/database'); onClose(); } },
    { id: 'events', title: 'Go to Events', description: 'Browse all events and dossiers', category: 'Pages', icon: Calendar, action: () => { navigate('/events'); onClose(); } },
    { id: 'teams', title: 'Go to Teams', description: 'Manage Logistics and Sponsoring teams', category: 'Pages', icon: Users, action: () => { navigate('/teams'); onClose(); } },
    { id: 'profile', title: 'Go to My Profile', description: 'View your profile and progress', category: 'Pages', icon: User, action: () => { navigate('/profile'); onClose(); } },
    
    // Quick Actions
    { id: 'add-sponsorship', title: 'Add Sponsorship Contract', description: 'Register a new sponsorship lead', category: 'Actions', icon: Building2, action: () => { navigate('/teams/sponsoring/1/add'); onClose(); } },
    { id: 'add-logistics', title: 'Add Logistics Resource', description: 'Allocate a new resource or venue', category: 'Actions', icon: Box, action: () => { navigate('/teams/logistics/add'); onClose(); } },
    { id: 'add-db-entry', title: 'Add Database Entry', description: 'Insert a new item to DB', category: 'Actions', icon: Database, action: () => { navigate('/database/add'); onClose(); } },

    // Events Workspaces
    { id: 'evt-aec', title: 'Open AEC Workspace', description: 'Algerian Engineering Competition', category: 'Events', icon: Sparkles, action: () => { navigate('/events/1/dossier'); onClose(); } },
    { id: 'evt-poly', title: 'Open Polymaze Workspace', description: 'Robotics Labyrinth Competition', category: 'Events', icon: Sparkles, action: () => { navigate('/events/3/dossier'); onClose(); } },
    { id: 'evt-gala', title: 'Open GALA Workspace', description: 'Premium annual networking event', category: 'Events', icon: Sparkles, action: () => { navigate('/events/2/dossier'); onClose(); } },
    { id: 'evt-steps', title: 'Open STEPS Workspace', description: 'Career path mentoring program', category: 'Events', icon: Sparkles, action: () => { navigate('/events/5/dossier'); onClose(); } },
    { id: 'evt-mclass', title: 'Open MasterClass Workspace', description: 'Specialized technology seminars', category: 'Events', icon: Sparkles, action: () => { navigate('/events/6/dossier'); onClose(); } },
  ];

  const filteredItems = items.filter(item =>
    advancedMatch({
      title: item.title,
      description: item.description,
      category: item.category,
    }, query)
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-950/40 backdrop-blur-[4px] transition-opacity" onClick={onClose} />

      {/* Panel */}
      <div 
        ref={containerRef}
        className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 w-full max-w-lg overflow-hidden flex flex-col max-h-[50vh] transition-all duration-300 transform scale-100"
      >
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-gray-100 py-3.5">
          <Search className="text-gray-400 mr-3" size={20} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-0 text-text placeholder-gray-400 focus:outline-none focus:ring-0 text-base"
          />
          <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-500">
            <span>ESC</span>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto py-2">
          {filteredItems.length > 0 ? (
            <div className="space-y-1 px-2">
              {filteredItems.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className={clsx(
                      "w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 group",
                      isSelected 
                        ? "bg-primary text-white shadow-md shadow-primary/20" 
                        : "hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={clsx(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary"
                      )}>
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className={clsx("text-sm font-semibold truncate", isSelected ? "text-white" : "text-text")}>{item.title}</p>
                        <p className={clsx("text-[11px] truncate", isSelected ? "text-white/80" : "text-gray-400")}>{item.description}</p>
                      </div>
                    </div>
                    {isSelected ? (
                      <CornerDownLeft size={14} className="text-white/70" />
                    ) : (
                      <span className="text-[10px] text-gray-400 uppercase font-bold bg-gray-100 px-2 py-0.5 rounded group-hover:bg-primary/10 group-hover:text-primary">
                        {item.category}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">No results found for "{query}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function LayoutDashboardIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}
