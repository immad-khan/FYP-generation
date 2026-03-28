import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, BookOpen, Bookmark, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/student/dashboard' },
    { name: 'Profile', icon: <User size={20} />, path: '/student/profile' },
    { name: 'Semester Records', icon: <BookOpen size={20} />, path: '/student/records' },
    { name: 'Saved Ideas', icon: <Bookmark size={20} />, path: '/student/saved' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/student/settings' },
  ];

  return (
    <aside className="w-72 bg-[#1A1A2E] border-r border-white/5 flex flex-col h-screen sticky top-0 hidden md:flex">
      <div className="p-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent font-heading">
          FYP GENERATOR
        </h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-4 rounded-2xl transition-all font-medium ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500/10 to-transparent text-pink-500 border-l-4 border-pink-500'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span className="font-heading tracking-wide uppercase text-xs">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5">
        <button
          onClick={logout}
          className="flex items-center gap-4 px-6 py-4 w-full text-gray-500 hover:text-red-400 transition-colors uppercase text-xs font-bold tracking-widest font-heading"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
