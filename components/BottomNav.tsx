import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, Edit3, User, ScrollText } from 'lucide-react';
import { api } from '../services/api';
import { supabase } from '../lib/supabaseClient';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [dueCount, setDueCount] = React.useState(0);

  React.useEffect(() => {
    const fetchStats = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const stats = await api.getDictionaryStats(session.user.id);
        setDueCount(stats.due);
      }
    };

    fetchStats();

    // Listen for custom update event
    const handleUpdate = () => fetchStats();
    window.addEventListener('study-progress-updated', handleUpdate);

    return () => {
      window.removeEventListener('study-progress-updated', handleUpdate);
    };
  }, []);

  const navItems = [
    { icon: Home, label: '首页', path: '/' },
    { icon: BookOpen, label: '词典', path: '/dictionary' },
    { icon: ScrollText, label: '背诵', path: '/recite' },
    { icon: Edit3, label: '练习', path: '/practice', badge: dueCount },

    { icon: User, label: '个人', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 pb-safe pt-2 px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-between items-center h-16">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 w-16 transition-colors ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <div className="relative">
                <item.icon size={26} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? "currentColor" : "none"} className={isActive ? "fill-primary/20" : ""} />
                {item.badge ? (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
      {/* Safe area spacer for iOS */}
      <div className="h-4 w-full bg-white"></div>
    </nav>
  );
};

export default BottomNav;