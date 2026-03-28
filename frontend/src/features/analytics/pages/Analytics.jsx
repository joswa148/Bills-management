import React from 'react';
import { PieChart as PieIcon, TrendingUp } from 'lucide-react';
import SpendingChart from '../components/SpendingChart';

export default function Analytics() {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="max-w-7xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-secondary-900 tracking-tight">Analytics</h2>
        <p className="text-sm font-medium text-secondary-500 mt-1.5 flex items-center">
          <TrendingUp className="w-4 h-4 mr-1.5 text-primary-500" />
          Detailed insights into your spending habits and category distribution.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-8 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-[2.5rem] border border-secondary-100 p-10 premium-shadow">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-secondary-900">Spending by Category</h3>
          </div>
          <div className="h-[450px]">
            <SpendingChart />
          </div>
        </div>
      </div>
    </div>
  );
}
