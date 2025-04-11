'use client';

import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, description, trend, icon }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-5 lg:p-6 w-full">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{title}</p>
        <div className="rounded-full bg-gray-100 p-1.5 sm:p-2 flex-shrink-0">
          {icon}
        </div>
      </div>
      <div className="flex flex-wrap items-baseline gap-1 sm:gap-2">
        <h3 className="text-xl sm:text-2xl font-bold truncate">{value}</h3>
        <div className={`flex items-center text-xs font-medium ${
          trend === 'up' ? 'text-green-600' : 
          trend === 'down' ? 'text-red-600' : 
          'text-gray-600'
        }`}>
          {trend === 'up' && <ArrowUp className="w-3 h-3 mr-1 flex-shrink-0" />}
          {trend === 'down' && <ArrowDown className="w-3 h-3 mr-1 flex-shrink-0" />}
          <span className="truncate">{description}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;