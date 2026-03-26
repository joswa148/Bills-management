import React, { useMemo } from 'react';
import BillsChart from '../components/BillsChart';
import { useQuery } from '@tanstack/react-query';
import { billsApi } from '../../../lib/api/billsApi';

export default function Dashboard() {
  const { data: bills } = useQuery({
    queryKey: ['bills'],
    queryFn: billsApi.getBills,
  });

  const stats = useMemo(() => {
    if (!bills) return { total: 0, paid: 0, pending: 0 };
    return bills.reduce((acc, curr) => {
      acc.total += curr.priceINR;
      if (curr.status === 'Paid') acc.paid += curr.priceINR;
      else acc.pending += curr.priceINR;
      return acc;
    }, { total: 0, paid: 0, pending: 0 });
  }, [bills]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overivew</h2>
          <p className="text-sm text-gray-500 mt-1">Welcome back. Here is what's happening today.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Placeholder summary cards */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Bills Value</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">₹{stats.total.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-gray-500">Pending Amount</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">₹{stats.pending.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-gray-500">Paid Amount</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">₹{stats.paid.toLocaleString()}</p>
        </div>
      </div>

      <BillsChart />
    </div>
  );
}
