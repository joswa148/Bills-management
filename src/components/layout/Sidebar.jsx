import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Receipt, Settings, BarChart } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Bills', href: '/bills', icon: FileText },
  { name: 'Invoices', href: '/invoices', icon: Receipt },
  { name: 'Reports', href: '/reports', icon: BarChart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-slate-900 border-r border-slate-800">
        <div className="flex flex-col flex-1 h-0 overflow-y-auto">
          <div className="flex items-center justify-center h-16 px-4 bg-slate-950">
            <h1 className="text-xl font-bold tracking-tight text-white">BillDash</h1>
          </div>
          <div className="flex-1 px-3 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-500'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-white'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
