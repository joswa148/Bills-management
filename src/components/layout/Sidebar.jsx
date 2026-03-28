import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CreditCard, PieChart, Settings, Bell } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
  { name: 'Analytics', href: '/analytics', icon: PieChart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-72 bg-secondary-900 border-r border-secondary-800">
        <div className="flex flex-col flex-1 h-0 overflow-y-auto no-scrollbar">
          <div className="flex items-center px-8 h-20 bg-secondary-950/50 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center mr-3 shadow-lg shadow-primary-500/20">
              <CreditCard className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">BillDash<span className="text-primary-400">.</span></h1>
          </div>
          <div className="flex-1 px-4 py-8 space-y-2">
            <p className="px-4 text-[10px] font-bold text-secondary-500 uppercase tracking-[0.2em] mb-4">Main Menu</p>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-300 ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                      : 'text-secondary-400 hover:bg-secondary-800/50 hover:text-white'
                  }`}
                >
                  <item.icon
                    className={`mr-3.5 flex-shrink-0 h-5 w-5 transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-secondary-500 group-hover:text-secondary-300'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
          
          <div className="p-6 mt-auto">
            <div className="bg-secondary-800/40 rounded-3xl p-5 border border-secondary-700/30">
              <p className="text-xs font-semibold text-white mb-1">Upgrade to Pro</p>
              <p className="text-[11px] text-secondary-400 mb-4 leading-relaxed">Get advanced insights and unlimited exports.</p>
              <button className="w-full py-2.5 px-4 bg-white text-secondary-900 text-xs font-bold rounded-xl hover:bg-secondary-50 transition-colors shadow-sm">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
