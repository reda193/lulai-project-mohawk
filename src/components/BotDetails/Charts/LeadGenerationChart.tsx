'use client';

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LeadGenerationChartProps {
  timeRange: '7d' | '30d' | '90d';
}

const LeadGenerationChart: React.FC<LeadGenerationChartProps> = ({ timeRange }) => {
  // Generate random lead data based on time range
  const data = useMemo(() => {
    let days;
    switch (timeRange) {
      case '7d': days = 7; break;
      case '30d': days = 4; break; // Use weeks for 30d
      case '90d': days = 3; break; // Use months for 90d
      default: days = 7;
    }
    
    const result = [];
    
    for (let i = 0; i < days; i++) {
      let label;
      if (timeRange === '7d') {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        label = date.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (timeRange === '30d') {
        label = `Week ${i + 1}`;
      } else {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const date = new Date();
        date.setMonth(date.getMonth() - (days - i - 1));
        label = monthNames[date.getMonth()];
      }
      
      // Base numbers
      const baseLeads = timeRange === '7d' ? 12 : timeRange === '30d' ? 45 : 120;
      const randomFactor = Math.random() * 0.5 + 0.75; // 0.75 to 1.25
      
      result.push({
        name: label,
        leads: Math.round(baseLeads * randomFactor),
      });
    }
    
    return result;
  }, [timeRange]);

  // Calculate total leads
  const totalLeads = useMemo(() => {
    return data.reduce((sum, item) => sum + item.leads, 0);
  }, [data]);

  return (
    <div className="h-72">
      <div className="text-center mb-2">
        <div className="text-sm text-gray-500">Total Leads Generated</div>
        <div className="text-2xl font-bold">{totalLeads}</div>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number) => [value, 'Leads']}
            contentStyle={{ 
              backgroundColor: '#fff', 
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: 'none',
              padding: '0.75rem'
            }}
          />
          <Bar dataKey="leads" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={timeRange === '7d' ? 30 : 50} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LeadGenerationChart;