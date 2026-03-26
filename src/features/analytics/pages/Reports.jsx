import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { billsApi } from '../../../lib/api/billsApi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Download, FileText, Share2 } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function Reports() {
  const { data: bills } = useQuery({
    queryKey: ['bills'],
    queryFn: billsApi.getBills,
  });

  const regionData = useMemo(() => {
    if (!bills) return [];
    const regionMap = {};
    bills.forEach(bill => {
      const region = bill.region || 'Unknown';
      regionMap[region] = (regionMap[region] || 0) + bill.priceINR;
    });
    return Object.entries(regionMap).map(([name, value]) => ({ name, value }));
  }, [bills]);

  const bankData = useMemo(() => {
    if (!bills) return [];
    const bankMap = {};
    bills.forEach(bill => {
      const bank = bill.bank || 'Unknown';
      bankMap[bank] = (bankMap[bank] || 0) + bill.priceINR;
    });
    return Object.entries(bankMap).map(([name, value]) => ({ name, value }));
  }, [bills]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Financial Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Deep dive into your spending habits and regional distributions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Download size={16} /> Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
            <FileText size={16} /> PDF Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Region Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-gray-700">Spending by Region (INR)</h3>
              <Share2 size={16} className="text-gray-400 cursor-pointer" />
           </div>
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={regionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {regionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Bank Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-gray-700">Distribution by Bank</h3>
           </div>
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bankData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F3F4F6" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

       {/* Monthly Trend - Placeholder logic for full year trend */}
       <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <h3 className="text-sm font-semibold text-gray-700 mb-6">Spending Trend (Historical)</h3>
          <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { name: 'Jan', val: 4000 },
                  { name: 'Feb', val: 3000 },
                  { name: 'Mar', val: 2000 },
                  { name: 'Apr', val: 2780 },
                  { name: 'May', val: 1890 },
                  { name: 'Jun', val: 2390 },
                  { name: 'Jul', val: 3490 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Line type="monotone" dataKey="val" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
             </ResponsiveContainer>
          </div>
       </div>
    </div>
  );
}
