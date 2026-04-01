import React, { useState } from 'react';
import { User, Lock, Globe, Bell, ChevronRight, Settings as SettingsIcon } from 'lucide-react';
import ProfileSettings from '../components/ProfileSettings';
import SecuritySettings from '../components/SecuritySettings';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User, desc: 'Update your personal information' },
    { id: 'security', name: 'Security', icon: Lock, desc: 'Manage password and 2FA' },
    { id: 'preferences', name: 'Preferences', icon: Globe, desc: 'Currency and language settings' },
    { id: 'notifications', name: 'Notifications', icon: Bell, desc: 'Configure renewal alerts' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'security':
        return <SecuritySettings />;
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in shadow-inner bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-secondary-100">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-secondary-50">
                <SettingsIcon className="w-8 h-8 text-secondary-300" />
            </div>
            <h3 className="text-lg font-bold text-secondary-900">Module Under Construction</h3>
            <p className="text-sm text-secondary-500 max-w-xs mt-1">This settings module is being optimized for your regional compliance. Stay tuned! 💎</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="max-w-6xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-secondary-900 tracking-tight">Settings</h2>
        <p className="text-sm font-medium text-secondary-500 mt-1.5">
          Customize your dashboard experience and security protocols.
        </p>
      </div>

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left group p-5 rounded-3xl border transition-all duration-300 flex items-center premium-shadow ${
                activeTab === tab.id 
                ? 'bg-white border-primary-200 shadow-lg shadow-primary-500/5 ring-1 ring-primary-100' 
                : 'bg-transparent border-transparent hover:bg-white hover:border-secondary-100'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 transition-colors ${
                activeTab === tab.id ? 'bg-primary-50' : 'bg-secondary-50 group-hover:bg-primary-50'
              }`}>
                <tab.icon className={`w-5 h-5 transition-colors ${
                  activeTab === tab.id ? 'text-primary-600' : 'text-secondary-400 group-hover:text-primary-500'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className={`text-sm font-bold transition-colors ${
                  activeTab === tab.id ? 'text-secondary-900' : 'text-secondary-600 group-hover:text-secondary-900'
                }`}>{tab.name}</h3>
                <p className="text-[10px] text-secondary-400 font-medium uppercase tracking-tight mt-0.5">{tab.desc}</p>
              </div>
              <ChevronRight className={`w-4 h-4 transition-all ${
                activeTab === tab.id ? 'text-primary-400 opacity-100 translate-x-1' : 'text-secondary-200 opacity-0'
              }`} />
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-8 bg-white border border-secondary-100 rounded-[2.5rem] p-10 min-h-[600px] premium-shadow border-t-4 border-t-primary-500 shadow-2xl shadow-secondary-900/5">
            {renderContent()}
        </div>
      </div>
    </div>
  );
}
