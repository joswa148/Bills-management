import React, { useMemo, useEffect } from 'react';
import BillsChart from '../components/BillsChart';
import { useSubscriptionStore } from '../../../store/useSubscriptionStore';
import { TrendingUp, CreditCard, Clock, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  const { subscriptions: bills, fetchSubscriptions } = useSubscriptionStore();

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const stats = useMemo(() => {
    if (!bills) return { total: 0, paid: 0, pending: 0 };
    return bills.reduce((acc, curr) => {
      acc.total += curr.priceINR;
      if (curr.status === 'Active') acc.paid += curr.priceINR; // Using Active as proxy for paid for now or add actual status
      else acc.pending += curr.priceINR;
      return acc;
    }, { total: 0, paid: 0, pending: 0 });
  }, [bills]);

  const cards = [
    { title: 'Total Expenses', value: `₹${stats.total.toLocaleString()}`, icon: CreditCard, color: 'text-primary-600', bg: 'bg-primary-50', trend: '+12.5% from last month' },
    { title: 'Pending Payments', value: `₹${stats.pending.toLocaleString()}`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', trend: '3 bills due soon' },
    { title: 'Amount Paid', value: `₹${stats.paid.toLocaleString()}`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'Excellent progress!' },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="max-w-7xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-secondary-900 tracking-tight">Dashboard Overview</h2>
        <p className="text-sm font-medium text-secondary-500 mt-1.5 flex items-center">
          <TrendingUp className="w-4 h-4 mr-1.5 text-primary-500" />
          Welcome back. Here is your financial health summary.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto w-full">
        {cards.map((card) => (
          <div key={card.title} className="bg-white p-8 rounded-[2rem] border border-secondary-100 flex flex-col premium-shadow hover:scale-[1.02] transition-all duration-300 group">
            <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
              <card.icon className={`w-7 h-7 ${card.color}`} />
            </div>
            <h3 className="text-sm font-bold text-secondary-400 uppercase tracking-widest">{card.title}</h3>
            <p className="text-3xl font-extrabold text-secondary-900 mt-3 tabular-nums">{card.value}</p>
            <div className="mt-4 pt-4 border-t border-secondary-50">
              <span className="text-[11px] font-bold text-secondary-400">{card.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-[2.5rem] border border-secondary-100 p-10 premium-shadow">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-secondary-900">Spending Trends</h3>
            <select className="bg-secondary-50 border-none rounded-xl text-xs font-bold text-secondary-600 px-4 py-2 focus:ring-2 focus:ring-primary-500/20">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[350px] w-full bg-secondary-50/30 rounded-[2rem] flex items-center justify-center text-secondary-300 font-medium italic border border-dashed border-secondary-100">
             <BillsChart />
          </div>
        </div>
      </div>
    </div>
  );
}
