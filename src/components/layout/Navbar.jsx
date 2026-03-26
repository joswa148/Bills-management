import React from 'react';
import { Bell, Search, User } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="flex-shrink-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
      <div className="flex items-center flex-1">
        <div className="w-full max-w-md relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            placeholder="Search bills, invoices..."
          />
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <button className="text-gray-400 hover:text-gray-600 transition-colors relative">
          <Bell className="h-6 w-6" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
        <div className="flex items-center space-x-3 cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition-colors">
            <User className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-700">Admin User</p>
            <p className="text-xs text-gray-500">admin@demo.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}
