import React from 'react';
import { Bell, Search, User, Filter, LogOut } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuthStore } from '../../store/useAuthStore';
import { Dropdown, message } from 'antd';

export default function Navbar() {
  const { notifications } = useNotifications();
  const { user, logout } = useAuthStore();
  const hasNotifications = notifications.length > 0;

  const handleLogout = () => {
    logout();
    message.success('Logged out successfully');
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: 'My Profile',
      icon: <User size={14} />,
    },
    {
      key: 'logout',
      label: 'Sign Out',
      icon: <LogOut size={14} />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="flex-shrink-0 h-20 bg-white/80 backdrop-blur-md border-b border-secondary-100 flex items-center justify-between px-8 z-10 sticky top-0">
      <div className="flex items-center flex-1">
        <div className="w-full max-w-lg relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="h-4.5 w-4.5 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-12 py-2.5 border border-secondary-200 rounded-2xl leading-5 bg-secondary-50/50 placeholder-secondary-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 sm:text-sm transition-all duration-300"
            placeholder="Search subscriptions, banks, regions..."
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <span className="text-[10px] font-bold text-secondary-400 bg-secondary-200/50 px-1.5 py-0.5 rounded-md uppercase tracking-wider">⌘K</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-5 ml-8">
        <button className="p-2.5 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-300 relative group">
          <Bell className="h-5 w-5" />
          {hasNotifications && (
            <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white ring-2 ring-white group-hover:scale-110 transition-transform">
              {notifications.length}
            </span>
          )}
        </button>
        
        <button className="p-2.5 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-300">
          <Filter className="h-5 w-5" />
        </button>

        <div className="h-8 w-[1px] bg-secondary-100 mx-2" />

        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
          <div className="flex items-center space-x-3.5 cursor-pointer group pl-2">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <User className="h-5.5 w-5.5" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-bold text-secondary-900 leading-tight">{user?.name || 'User'}</p>
              <p className="text-[11px] text-secondary-500 font-medium">{user?.role === 'admin' ? 'Pro Account' : 'Free Plan'}</p>
            </div>
          </div>
        </Dropdown>
      </div>
    </header>
  );
}
