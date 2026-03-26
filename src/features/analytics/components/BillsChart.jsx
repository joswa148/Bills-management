import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { billsApi } from '../../../lib/api/billsApi';

export default function BillsChart() {
  const { data: bills } = useQuery({
    queryKey: ['bills'],
    queryFn: billsApi.getBills,
  });

  const chartData = useMemo(() => {
    if (!bills) return [];
    
    // Group bills by month for charts
    const monthlyData = {};
    bills.forEach(bill => {
      const date = bill.date ? new Date(bill.date) : new Date();
      const month = date.toLocaleString('default', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { name: month, INR: 0, AED: 0 };
      }
      monthlyData[month].INR += bill.priceINR || 0;
      monthlyData[month].AED += bill.priceAED || 0;
    });

    return Object.values(monthlyData);
  }, [bills]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-80 w-full mt-6 transition-all hover:shadow-md">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Expenses by Month</h3>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
          <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
          <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
          <Bar dataKey="INR" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="AED" fill="#10B981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
