import React from 'react';
import { Settings as SettingsIcon, User, Lock, Globe, Bell } from 'lucide-react';

export default function Settings() {
  const sections = [
    { name: 'Profile', icon: User, desc: 'Update your personal information' },
    { name: 'Security', icon: Lock, desc: 'Manage password and 2FA' },
    { name: 'Preferences', icon: Globe, desc: 'Currency and language settings' },
    { name: 'Notifications', icon: Bell, desc: 'Configure renewal alerts' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="max-w-3xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-secondary-900 tracking-tight">Settings</h2>
        <p className="text-sm font-medium text-secondary-500 mt-1.5">
          Customize your dashboard experience.
        </p>
      </div>

      <div className="max-w-3xl mx-auto w-full space-y-4">
        {sections.map((section) => (
          <div key={section.name} className="group bg-white rounded-3xl border border-secondary-100 p-6 flex items-center hover:border-primary-200 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 cursor-pointer premium-shadow">
            <div className="w-12 h-12 rounded-2xl bg-secondary-50 flex items-center justify-center mr-5 group-hover:bg-primary-50 transition-colors">
              <section.icon className="w-6 h-6 text-secondary-400 group-hover:text-primary-500 transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-secondary-900">{section.name}</h3>
              <p className="text-xs text-secondary-500 mt-0.5">{section.desc}</p>
            </div>
            <div className="ml-auto w-8 h-8 rounded-full border border-secondary-100 flex items-center justify-center group-hover:border-primary-200 group-hover:bg-primary-50 transition-all">
              <span className="text-secondary-300 group-hover:text-primary-500 transition-colors">→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
