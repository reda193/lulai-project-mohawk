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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="rounded-full bg-gray-100 p-2">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline space-x-2">
        <h3 className="text-2xl font-bold">{value}</h3>
        <div className={`flex items-center text-xs font-medium ${
          trend === 'up' ? 'text-green-600' : 
          trend === 'down' ? 'text-red-600' : 
          'text-gray-600'
        }`}>
          {trend === 'up' && <ArrowUp className="w-3 h-3 mr-1" />}
          {trend === 'down' && <ArrowDown className="w-3 h-3 mr-1" />}
          <span>{description}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;